import type { AssetSymbol, MarketSnapshot } from "./verdict";

const API_BASE = process.env["SOSOVALUE_API_BASE"] || "https://openapi.sosovalue.com/openapi/v1";

function envNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export type SoSoValueAdapterResult = {
  mode: "live" | "demo";
  snapshot?: MarketSnapshot;
  error?: string;
  latencyMs?: number;
};

type UnknownRecord = Record<string, unknown>;

const symbolFallback: Record<AssetSymbol, { price: number; change: number; flow: number; sentiment: number; vol: number; momentum: number }> = {
  BTC: { price: 107420, change: 2.88, flow: 238_000_000, sentiment: 0.44, vol: 3.8, momentum: 3.92 },
  ETH: { price: 3890, change: 1.44, flow: 64_000_000, sentiment: 0.31, vol: 4.7, momentum: 2.07 },
  SOL: { price: 182, change: -1.44, flow: -12_000_000, sentiment: -0.12, vol: 8.9, momentum: -1.56 },
};

function asArray(payload: unknown): UnknownRecord[] {
  if (Array.isArray(payload)) return payload.filter((item): item is UnknownRecord => typeof item === "object" && item !== null);
  if (typeof payload !== "object" || payload === null) return [];
  const record = payload as UnknownRecord;
  for (const key of ["data", "list", "items", "result", "rows"]) {
    const value = record[key];
    if (Array.isArray(value)) return value.filter((item): item is UnknownRecord => typeof item === "object" && item !== null);
    if (typeof value === "object" && value !== null) {
      const nested = asArray(value);
      if (nested.length) return nested;
    }
  }
  return [];
}

function firstNumber(record: UnknownRecord | undefined, keys: string[], fallback: number) {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function firstString(record: UnknownRecord | undefined, keys: string[]) {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

async function fetchWithTimeout(url: URL, credential: string) {
  const timeoutMs = envNumber("SOSOVALUE_API_TIMEOUT_MS", 8_000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        "x-soso-api-key": credential,
        "accept": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function getJson(path: string, params: Record<string, string | number | undefined>, credential: string) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const attempts = envNumber("SOSOVALUE_API_RETRIES", 1) + 1;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, credential);
      const text = await response.text();
      if (!response.ok) throw new Error(`${path} ${response.status}: ${text.slice(0, 220)}`);
      const parsed = JSON.parse(text) as unknown;
      if (typeof parsed === "object" && parsed !== null && "data" in parsed) return (parsed as UnknownRecord).data;
      return parsed;
    } catch (error) {
      lastError = error;
      if (attempt >= attempts) break;
    }
  }
  if (lastError instanceof Error) throw lastError;
  throw new Error(`${path} failed after ${attempts} attempts`);
}

const DEMO_TIMESTAMP = "2026-01-01T00:00:00.000Z";

function demoSnapshot(asset: AssetSymbol, label = "SoSoValue demo adapter"): MarketSnapshot {
  const now = DEMO_TIMESTAMP;
  const item = symbolFallback[asset];
  return {
    asset,
    timestamp: now,
    price: item.price,
    priceChange24hPct: item.change,
    etfFlowUsd: item.flow,
    newsSentiment: item.sentiment,
    realizedVolatilityPct: item.vol,
    ssiMomentumPct: item.momentum,
    sources: [
      {
        name: `${label}: market snapshot`,
        url: "https://sosovalue-1.gitbook.io/sosovalue-api-doc/1.-currency-and-pairs/market-snapshot",
        capturedAt: now,
        fields: { price: item.price, priceChange24hPct: item.change, realizedVolatilityPct: item.vol },
      },
      {
        name: `${label}: ETF/news flow`,
        url: "https://sosovalue-1.gitbook.io/sosovalue-api-doc/2.-etf/summary-history",
        capturedAt: now,
        fields: { etfFlowUsd: item.flow, newsSentiment: item.sentiment, ssiMomentumPct: item.momentum },
      },
    ],
  };
}

export function buildDemoMarketSnapshot(asset: AssetSymbol): MarketSnapshot {
  return demoSnapshot(asset);
}

function classifyAdapterError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") return "timeout";
  if (!(error instanceof Error)) return "unknown_error";
  const message = error.message.toLowerCase();
  if (/\s4\d\d:/.test(message)) return "upstream_4xx";
  if (/\s5\d\d:/.test(message)) return "upstream_5xx";
  if (message.includes("json")) return "parse_error";
  if (message.includes("abort") || message.includes("timeout")) return "timeout";
  return "upstream_error";
}

export async function fetchSoSoValueMarketSnapshot(asset: AssetSymbol): Promise<SoSoValueAdapterResult> {
  const credential = process.env["SOSOVALUE_API_KEY"]?.trim();
  if (!credential) return { mode: "demo", snapshot: demoSnapshot(asset), error: "SOSOVALUE_API_KEY not configured" };

  const started = Date.now();
  try {
    const currencies = asArray(await getJson("/currencies", {}, credential));
    const currency = currencies.find((item) => String(item.symbol || item.currency_symbol || "").toUpperCase() === asset) || currencies[0];
    const currencyId = firstString(currency, ["id", "currency_id", "currencyId"]);

    const [marketPayload, etfPayload, newsPayload] = await Promise.all([
      currencyId ? getJson(`/currencies/${currencyId}/market-snapshot`, {}, credential) : Promise.resolve(undefined),
      getJson("/etfs/summary-history", { symbol: asset, country_code: "US", page_size: 10 }, credential),
      getJson("/news", { page: 1, page_size: 20 }, credential),
    ]);

    const market = (typeof marketPayload === "object" && marketPayload !== null ? marketPayload : {}) as UnknownRecord;
    const marketRows = asArray(marketPayload);
    const etfRows = asArray(etfPayload);
    const newsRows = asArray(newsPayload);
    const marketRow = marketRows[0] || market;
    const etfRow = etfRows[0];
    const fallback = symbolFallback[asset];
    const now = new Date().toISOString();

    const positiveNews = newsRows.filter((item) => /bull|rise|surge|inflow|approval|record|gain/i.test(String(item.title || item.content || ""))).length;
    const negativeNews = newsRows.filter((item) => /bear|fall|drop|outflow|risk|hack|loss|crash/i.test(String(item.title || item.content || ""))).length;
    const newsSentiment = newsRows.length ? Number(((positiveNews - negativeNews) / Math.max(newsRows.length, 1)).toFixed(2)) : fallback.sentiment;

    const price = firstNumber(marketRow, ["price", "current_price", "close", "last_price"], fallback.price);
    const priceChangeRaw = firstNumber(marketRow, ["price_change_24h", "change_24h", "change_24h_percent", "change_pct_24h", "priceChange24hPct"], fallback.change);
    const priceChange24hPct = Math.abs(priceChangeRaw) < 1 ? Number((priceChangeRaw * 100).toFixed(2)) : priceChangeRaw;
    const etfFlowUsd = firstNumber(etfRow, ["net_inflow", "netInflow", "total_net_inflow", "value", "amount"], fallback.flow);
    const realizedVolatilityPct = firstNumber(marketRow, ["volatility", "realized_volatility", "volatility_24h", "turnover_rate"], fallback.vol);
    const ssiMomentumPct = Number((priceChange24hPct * 0.75 + newsSentiment * 4).toFixed(2));

    return {
      mode: "live",
      latencyMs: Date.now() - started,
      snapshot: {
        asset,
        timestamp: now,
        price,
        priceChange24hPct,
        etfFlowUsd,
        newsSentiment,
        realizedVolatilityPct,
        ssiMomentumPct,
        sources: [
          {
            name: "SoSoValue live currency market snapshot",
            url: `${API_BASE}/currencies/${currencyId || "<unresolved>"}/market-snapshot`,
            capturedAt: now,
            fields: { currencyId: currencyId || "unresolved", price, priceChange24hPct, realizedVolatilityPct },
          },
          {
            name: "SoSoValue live ETF summary history + news feed",
            url: `${API_BASE}/etfs/summary-history?symbol=${asset}`,
            capturedAt: now,
            fields: { etfFlowUsd, newsSentiment, ssiMomentumPct, newsItems: newsRows.length },
          },
        ],
      },
    };
  } catch (error) {
    return {
      mode: "demo",
      latencyMs: Date.now() - started,
      snapshot: demoSnapshot(asset, "SoSoValue demo fallback after live adapter error"),
      error: classifyAdapterError(error),
    };
  }
}
