import { ZodError } from "zod";
import { jsonError, packetRequestSchema } from "@/lib/api";
import { saveEvidencePacket } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createEvidencePacketWithLiveData, type AssetSymbol } from "@/lib/verdict";

export const runtime = "nodejs";

function validationDetails(error: ZodError) {
  return error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rate = checkRateLimit(`api-run:${clientIp}`);
  const rateHeaders = {
    "x-ratelimit-limit": String(rate.limit),
    "x-ratelimit-remaining": String(rate.remaining),
    "x-ratelimit-reset": String(rate.resetAt),
  };
  if (!rate.allowed) return jsonError("rate_limited", 429, { retryAfterMs: Math.max(rate.resetAt - Date.now(), 0) }, rateHeaders);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid_json", 400, undefined, rateHeaders);
  }

  const parsed = packetRequestSchema.safeParse(body);
  if (!parsed.success) return jsonError("validation_error", 400, validationDetails(parsed.error), rateHeaders);

  try {
    const packet = await createEvidencePacketWithLiveData({ ...parsed.data, asset: parsed.data.asset as AssetSymbol });
    saveEvidencePacket(packet);
    return Response.json(packet, { headers: rateHeaders });
  } catch {
    return jsonError("packet_generation_failed", 500, undefined, rateHeaders);
  }
}

export async function GET() {
  return jsonError("method_not_allowed", 405, { allowed: ["POST"] }, { allow: "POST" });
}
