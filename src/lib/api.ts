import { z } from "zod";

export const packetRequestSchema = z.object({
  asset: z.enum(["BTC", "ETH", "SOL"]).default("BTC"),
  notionalUsd: z.coerce.number().positive().max(10_000, "notionalUsd is capped at 10,000 USD until real-capital execution controls are enabled").default(1000),
  riskMode: z.enum(["balanced", "strict", "demo"]).default("balanced"),
});

export type PacketRequestInput = z.infer<typeof packetRequestSchema>;

export function requestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function jsonError(error: string, status: number, details?: unknown, headers?: HeadersInit) {
  return Response.json(
    {
      error,
      requestId: requestId(),
      details,
    },
    { status, headers },
  );
}
