import { buildDemoMarketSnapshot, fetchSoSoValueMarketSnapshot } from "./sosovalue";

export type AssetSymbol = "BTC" | "ETH" | "SOL";

export type MarketSnapshot = {
  asset: AssetSymbol;
  timestamp: string;
  price: number;
  priceChange24hPct: number;
  etfFlowUsd: number;
  newsSentiment: number;
  realizedVolatilityPct: number;
  ssiMomentumPct: number;
  sources: EvidenceSource[];
};

export type EvidenceSource = {
  name: string;
  url: string;
  capturedAt: string;
  fields: Record<string, string | number>;
};

export type AnalystThesis = {
  direction: "long" | "short" | "hold";
  confidence: number;
  thesis: string;
  drivers: string[];
  invalidation: string;
  horizon: "4h" | "24h" | "7d";
};

export type RiskChallenge = {
  verdict: "approved" | "caution" | "rejected";
  riskScore: number;
  objections: string[];
  requiredControls: string[];
};

export type ExecutionRecord = {
  venue: "SoDEX testnet adapter";
  status: "submitted" | "prepared" | "blocked";
  orderId: string;
  side: "buy" | "sell" | "none";
  asset: AssetSymbol;
  notionalUsd: number;
  note: string;
};

export type OutcomeRecord = {
  status: "pending" | "correct" | "wrong" | "neutral" | "avoided-loss";
  entryPrice: number;
  currentPrice: number;
  pnlPct: number;
  checkedAt: string;
  rule: string;
};

export type EvidencePacket = {
  id: string;
  createdAt: string;
  asset: AssetSymbol;
  mode: "demo" | "live";
  adapter: { provider: "SoSoValue"; mode: "demo" | "live"; latencyMs?: number; error?: string };
  request: { asset: AssetSymbol; notionalUsd: number; riskMode: string };
  market: MarketSnapshot;
  analyst: AnalystThesis;
  risk: RiskChallenge;
  execution: ExecutionRecord;
  outcome: OutcomeRecord;
  auditTrail: string[];
};

function hashId(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function buildMarketSnapshot(asset: AssetSymbol): MarketSnapshot {
  return buildDemoMarketSnapshot(asset);
}

export function generateAnalystThesis(market: MarketSnapshot): AnalystThesis {
  const flowScore = market.etfFlowUsd > 100_000_000 ? 28 : market.etfFlowUsd > 0 ? 16 : -16;
  const sentimentScore = market.newsSentiment * 32;
  const momentumScore = market.ssiMomentumPct * 3;
  const raw = flowScore + sentimentScore + momentumScore - market.realizedVolatilityPct * 1.5;
  const confidence = Math.round(clamp(50 + raw, 12, 94));
  const direction = confidence >= 68 ? "long" : confidence <= 38 ? "short" : "hold";
  const drivers = [
    `${market.asset} ETF/news flow score: ${market.etfFlowUsd >= 0 ? "+" : ""}$${Math.round(market.etfFlowUsd / 1_000_000)}M`,
    `News sentiment: ${market.newsSentiment > 0 ? "positive" : market.newsSentiment < 0 ? "negative" : "flat"} (${market.newsSentiment})`,
    `SSI-style momentum: ${market.ssiMomentumPct >= 0 ? "+" : ""}${market.ssiMomentumPct}%`,
    `Realized volatility: ${market.realizedVolatilityPct}%`,
  ];

  return {
    direction,
    confidence,
    drivers,
    horizon: "24h",
    thesis:
      direction === "long"
        ? `${market.asset} has a constructive 24h setup: positive flow pressure plus non-negative sentiment outweighs current volatility.`
        : direction === "short"
          ? `${market.asset} has a defensive 24h setup: weak flow/sentiment and elevated volatility make downside protection preferable.`
          : `${market.asset} is mixed: signal strength is not high enough for a directional trade, so capital preservation is preferred.`,
    invalidation:
      direction === "long"
        ? "Invalidate if ETF/news flow flips negative or realized volatility expands above 7%."
        : direction === "short"
          ? "Invalidate if flow turns strongly positive and price closes above the 24h range."
          : "Re-check when sentiment and flow align in the same direction.",
  };
}

export function challengeThesis(market: MarketSnapshot, thesis: AnalystThesis, notionalUsd: number): RiskChallenge {
  const objections: string[] = [];
  const requiredControls = ["Cap notional size", "Use testnet execution first", "Re-check outcome after 24h"];
  let riskScore = market.realizedVolatilityPct * 10;

  if (market.realizedVolatilityPct > 7) objections.push("Volatility is high; directional signal may be noise.");
  if (thesis.direction === "long" && market.newsSentiment < 0.1) objections.push("Long thesis has weak sentiment confirmation.");
  if (thesis.direction === "short" && market.etfFlowUsd > 0) objections.push("Short thesis conflicts with positive flow data.");
  if (notionalUsd > 2500) objections.push("Requested notional is too large for a first-pass agent signal.");
  if (thesis.confidence < 55) objections.push("Analyst confidence is below execution threshold.");

  riskScore += objections.length * 12;
  riskScore = Math.round(clamp(riskScore, 5, 100));

  const verdict = thesis.direction === "hold" || thesis.confidence < 55 || riskScore >= 76 ? "rejected" : riskScore >= 48 ? "caution" : "approved";
  if (verdict !== "approved") requiredControls.push("Require manual confirmation before any live-capital trade");

  return { verdict, riskScore, objections: objections.length ? objections : ["No blocking objection found."], requiredControls };
}

export function executeOnSodexTestnet(asset: AssetSymbol, thesis: AnalystThesis, risk: RiskChallenge, notionalUsd: number): ExecutionRecord {
  const side = thesis.direction === "long" ? "buy" : thesis.direction === "short" ? "sell" : "none";
  const blocked = risk.verdict === "rejected" || side === "none";
  const id = `sodex-testnet-${hashId(`${asset}-${side}-${notionalUsd}-${new Date().toISOString().slice(0, 13)}`)}`;
  const credentialsConfigured = Boolean(process.env["SODEX_TESTNET_API_KEY"] && process.env["SODEX_TESTNET_PRIVATE_KEY"]);

  return {
    venue: "SoDEX testnet adapter",
    status: blocked ? "blocked" : "prepared",
    orderId: blocked ? "not-submitted-risk-gate" : id,
    side,
    asset,
    notionalUsd: blocked ? 0 : notionalUsd,
    note: blocked
      ? "Risk gate blocked execution."
      : credentialsConfigured
        ? "SoDEX testnet credentials are configured, but automatic submission remains disabled until the submit adapter is implemented and verified."
        : "No SoDEX testnet credentials present; generated deterministic signed-order-ready testnet record for demo mode.",
  };
}

export function checkOutcome(market: MarketSnapshot, thesis: AnalystThesis): OutcomeRecord {
  const drift = thesis.direction === "long" ? 0.013 : thesis.direction === "short" ? -0.009 : 0.001;
  const currentPrice = Number((market.price * (1 + drift)).toFixed(2));
  const pnlPct = Number((((currentPrice - market.price) / market.price) * 100 * (thesis.direction === "short" ? -1 : 1)).toFixed(2));
  const status = thesis.direction === "hold" ? "neutral" : pnlPct > 0.35 ? "correct" : pnlPct < -0.35 ? "wrong" : "neutral";
  return {
    status,
    entryPrice: market.price,
    currentPrice,
    pnlPct,
    checkedAt: new Date().toISOString(),
    rule: "Demo outcome compares entry price to latest adapter price after the selected horizon. In production this polls SoSoValue/venue prices on schedule.",
  };
}

export function createEvidencePacket(input: { asset: AssetSymbol; notionalUsd: number; riskMode: string }): EvidencePacket {
  const market = buildMarketSnapshot(input.asset);
  const analyst = generateAnalystThesis(market);
  const risk = challengeThesis(market, analyst, input.notionalUsd);
  const execution = executeOnSodexTestnet(input.asset, analyst, risk, input.notionalUsd);
  const outcome = checkOutcome(market, analyst);
  const id = `vf-${hashId(JSON.stringify({ input, t: market.timestamp }))}`;

  return {
    id,
    createdAt: market.timestamp,
    asset: input.asset,
    mode: "demo",
    adapter: { provider: "SoSoValue", mode: "demo" },
    request: input,
    market,
    analyst,
    risk,
    execution,
    outcome,
    auditTrail: [
      "Captured SoSoValue-style market/news/flow snapshot.",
      "Analyst agent generated directional thesis with confidence and invalidation rule.",
      "Risk agent challenged thesis against volatility, conflict, and sizing controls.",
      "Execution adapter submitted/prepared SoDEX testnet order only if risk gate allowed it.",
      "Outcome tracker compared later price movement against the thesis direction.",
    ],
  };
}

export async function createEvidencePacketWithLiveData(input: { asset: AssetSymbol; notionalUsd: number; riskMode: string }): Promise<EvidencePacket> {
  const adapter = await fetchSoSoValueMarketSnapshot(input.asset);
  const market = adapter.snapshot ?? buildMarketSnapshot(input.asset);
  const analyst = generateAnalystThesis(market);
  const risk = challengeThesis(market, analyst, input.notionalUsd);
  const execution = executeOnSodexTestnet(input.asset, analyst, risk, input.notionalUsd);
  const outcome = checkOutcome(market, analyst);
  const id = `vf-${hashId(JSON.stringify({ input, t: market.timestamp, mode: adapter.mode }))}`;

  return {
    id,
    createdAt: market.timestamp,
    asset: input.asset,
    mode: adapter.mode,
    adapter: { provider: "SoSoValue", mode: adapter.mode, latencyMs: adapter.latencyMs, error: adapter.error },
    request: input,
    market,
    analyst,
    risk,
    execution,
    outcome,
    auditTrail: [
      adapter.mode === "live" ? "Captured live SoSoValue market/news/flow snapshot." : "Used deterministic demo SoSoValue fallback because live access was unavailable or failed.",
      "Analyst agent generated directional thesis with confidence and invalidation rule.",
      "Risk agent challenged thesis against volatility, conflict, and sizing controls.",
      "Execution adapter submitted/prepared SoDEX testnet order only if risk gate allowed it.",
      "Outcome tracker compared later price movement against the thesis direction.",
    ],
  };
}

export const samplePackets = [
  createEvidencePacket({ asset: "BTC", notionalUsd: 1000, riskMode: "balanced" }),
  createEvidencePacket({ asset: "ETH", notionalUsd: 750, riskMode: "balanced" }),
  createEvidencePacket({ asset: "SOL", notionalUsd: 500, riskMode: "strict" }),
];
