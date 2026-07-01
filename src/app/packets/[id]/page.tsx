import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvidencePacket } from "@/lib/db";

export const runtime = "nodejs";

type PageProps = { params: Promise<{ id: string }> };

function JsonBlock({ value }: { value: unknown }) {
  return <pre className="overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-6 text-cyan-50">{JSON.stringify(value, null, 2)}</pre>;
}

export default async function PacketPage({ params }: PageProps) {
  const { id } = await params;
  const packet = getEvidencePacket(id);
  if (!packet) notFound();

  return (
    <main className="min-h-screen bg-[#050816] px-5 py-8 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-cyan-200 hover:text-cyan-100">← Back to VerdictFi</Link>
        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">Public evidence packet</p>
              <h1 className="mt-2 text-4xl font-black text-white">{packet.asset} · {packet.analyst.direction.toUpperCase()} verdict</h1>
              <p className="mt-3 max-w-3xl text-slate-300">{packet.analyst.thesis}</p>
            </div>
            <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">{packet.mode} mode</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-xs text-slate-400">Risk</p><p className="mt-1 text-2xl font-bold">{packet.risk.verdict}</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-xs text-slate-400">Execution</p><p className="mt-1 text-2xl font-bold">{packet.execution.status}</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-xs text-slate-400">Outcome</p><p className="mt-1 text-2xl font-bold">{packet.outcome.status}</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-xs text-slate-400">Confidence</p><p className="mt-1 text-2xl font-bold">{packet.analyst.confidence}%</p></div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <h2 className="text-xl font-bold text-white">Audit trail</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {packet.auditTrail.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <h2 className="text-xl font-bold text-white">Source data</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {packet.market.sources.map((source) => <li key={source.name}>• {source.name} — {source.url}</li>)}
            </ul>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xl font-bold text-white">Raw packet JSON</h2>
          <JsonBlock value={packet} />
        </section>
      </div>
    </main>
  );
}
