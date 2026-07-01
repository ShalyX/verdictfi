import { listEvidencePackets } from "@/lib/db";
import { samplePackets } from "@/lib/verdict";

export const runtime = "nodejs";

export async function GET() {
  const persisted = listEvidencePackets(50);
  const packets = persisted.length ? persisted : samplePackets;
  const wins = packets.filter((packet) => packet.outcome.status === "correct").length;
  return Response.json({
    generatedAt: new Date().toISOString(),
    totalSignals: packets.length,
    correctSignals: wins,
    winRatePct: Math.round((wins / packets.length) * 100),
    packets,
  });
}
