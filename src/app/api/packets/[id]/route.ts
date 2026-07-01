import { getEvidencePacket } from "@/lib/db";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, context: { params: Params }) {
  const { id } = await context.params;
  const packet = getEvidencePacket(id);
  if (!packet) return Response.json({ error: "packet not found" }, { status: 404 });
  return Response.json(packet);
}
