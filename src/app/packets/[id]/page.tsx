import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvidencePacket } from "@/lib/db";

export const runtime = "nodejs";

type PageProps = { params: Promise<{ id: string }> };

type StampTone = "approved" | "reject" | "brass" | "ink";

function Stamp({ children, tone = "ink" }: { children: React.ReactNode; tone?: StampTone }) {
  const toneClass = {
    approved: "stamp-approved",
    reject: "stamp-reject",
    brass: "stamp-brass",
    ink: "stamp-ink",
  }[tone];
  return <span className={`stamp ${toneClass}`}>{children}</span>;
}

function JsonBlock({ value }: { value: unknown }) {
  return <pre className="overflow-auto border border-paper-edge bg-charcoal p-4 font-evidence text-xs leading-6 text-paper">{JSON.stringify(value, null, 2)}</pre>;
}

export default async function PacketPage({ params }: PageProps) {
  const { id } = await params;
  const packet = getEvidencePacket(id);
  if (!packet) notFound();

  const verdictTone: StampTone = packet.risk.verdict === "approved" ? "approved" : packet.risk.verdict === "rejected" ? "reject" : "brass";

  return (
    <main className="min-h-screen bg-paper px-5 py-8 text-ink sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="font-evidence text-xs uppercase tracking-[0.18em] text-ink underline decoration-brass underline-offset-4">← Back to VerdictFi</Link>

        <section className="case-paper relative mt-12 border border-ink/25">
          <div className="case-tab absolute -top-8 left-0 bg-brass px-6 py-2 font-evidence text-xs font-bold uppercase tracking-[0.22em] text-ink">
            Public case file / {packet.id}
          </div>

          <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1fr_220px]">
            <div>
              <p className="font-evidence text-xs uppercase tracking-[0.35em] text-ink/55">Public evidence packet</p>
              <h1 className="font-display mt-3 text-5xl font-black leading-none text-ink">{packet.asset} · {packet.analyst.direction.toUpperCase()} verdict</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/75">{packet.analyst.thesis}</p>
            </div>
            <div className="flex flex-col items-start gap-4 border-l border-paper-edge pl-0 md:pl-6">
              <Stamp tone={verdictTone}>{packet.risk.verdict}</Stamp>
              <div className="evidence-tag w-full">
                <p className="font-evidence text-[0.62rem] uppercase tracking-[0.22em] text-ink/60">Mode of record</p>
                <p className="mt-1 font-evidence text-sm font-bold uppercase text-ink">{packet.mode} data</p>
              </div>
            </div>
          </div>

          <div className="grid border-y border-paper-edge bg-paper-deep md:grid-cols-4">
            <div className="border-l-2 border-brass px-4 py-4"><p className="font-evidence text-[0.62rem] uppercase tracking-[0.22em] text-ink/55">Risk</p><p className="font-display mt-1 text-2xl font-semibold">{packet.risk.verdict}</p></div>
            <div className="border-l-2 border-brass px-4 py-4"><p className="font-evidence text-[0.62rem] uppercase tracking-[0.22em] text-ink/55">Execution</p><p className="font-display mt-1 text-2xl font-semibold">{packet.execution.status}</p></div>
            <div className="border-l-2 border-brass px-4 py-4"><p className="font-evidence text-[0.62rem] uppercase tracking-[0.22em] text-ink/55">Outcome</p><p className="font-display mt-1 text-2xl font-semibold">{packet.outcome.status}</p></div>
            <div className="border-l-2 border-brass px-4 py-4"><p className="font-evidence text-[0.62rem] uppercase tracking-[0.22em] text-ink/55">Confidence</p><p className="font-display mt-1 text-2xl font-semibold">{packet.analyst.confidence}%</p></div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="border border-ink/25 bg-paper-deep p-5">
            <h2 className="font-display text-2xl font-bold text-ink">Audit trail</h2>
            <ul className="ruled-list mt-3 text-sm leading-6 text-ink/75">
              {packet.auditTrail.map((item) => <li key={item} className="py-2">{item}</li>)}
            </ul>
          </div>
          <div className="border border-ink/25 bg-paper-deep p-5">
            <h2 className="font-display text-2xl font-bold text-ink">Source evidence</h2>
            <ul className="ruled-list mt-3 text-sm leading-6 text-ink/75">
              {packet.market.sources.map((source) => <li key={source.name} className="py-2"><span className="font-semibold">{source.name}</span> — {source.url}</li>)}
            </ul>
          </div>
        </section>

        <section className="mt-8 border border-ink/25 bg-paper-deep p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-evidence text-xs uppercase tracking-[0.35em] text-ink/55">Evidence tag</p>
              <h2 className="font-display text-2xl font-bold text-ink">SoDEX preparation record</h2>
            </div>
            <Stamp tone={packet.execution.status === "blocked" ? "reject" : "brass"}>{packet.execution.status}</Stamp>
          </div>
          <div className="evidence-tag">
            <p className="font-evidence text-[0.62rem] uppercase tracking-[0.22em] text-ink/60">SODEX-PREP HASH</p>
            <p className="mt-1 break-all font-evidence text-sm font-semibold text-ink">{packet.execution.orderId}</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display mb-3 text-2xl font-bold text-ink">Raw packet JSON</h2>
          <JsonBlock value={packet} />
        </section>
      </div>
    </main>
  );
}
