type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function numberFromEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function trustProxyHeaders() {
  return process.env["VERDICTFI_TRUST_PROXY_HEADERS"] === "true";
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
};

export function getClientIp(request: Request) {
  if (!trustProxyHeaders()) return "direct-client";
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "trusted-proxy-unknown";
}

export function checkRateLimit(key: string): RateLimitResult {
  const limit = numberFromEnv("VERDICTFI_RATE_LIMIT_MAX", 30);
  const windowMs = numberFromEnv("VERDICTFI_RATE_LIMIT_WINDOW_MS", 60_000);
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt, limit };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt, limit };
  }

  current.count += 1;
  return { allowed: true, remaining: Math.max(limit - current.count, 0), resetAt: current.resetAt, limit };
}

export function resetRateLimiterForTests() {
  buckets.clear();
}
