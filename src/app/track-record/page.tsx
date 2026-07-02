import Link from "next/link";
import { samplePackets } from "@/lib/verdict";

export default function TrackRecordPage() {
  const correct = samplePackets.filter((item) => item.outcome.status === "correct").length;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="bg-charcoal px-5 py-8 text-paper sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="font-display text-2xl font-black">VerdictFi</Link>
            <Link href="/desk" className="border border-brass px-4 py-2 font-evidence text-xs font-bold uppercase tracking-[0.18em] text-brass hover:bg-brass hover:text-ink">Run the desk</Link>
          </nav>
          <p className="font-evidence mt-12 text-xs uppercase tracking-[0.35em] text-brass">Case log</p>
          <h1 className="font-display mt-3 max-w-4xl text-5xl font-black leading-none sm:text-7xl">Case log: every signal has to age in public.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-paper/75">This is the track record page, separate from the live desk. It reads like a case ledger, not a leaderboard.</p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-evidence text-xs uppercase tracking-[0.35em] text-ink/55">Recorded demo cases</p>
            <h2 className="font-display mt-2 text-4xl font-black">{correct}/{samplePackets.length} correct in sample log</h2>
          </div>
          <Link href="/desk" className="border-2 border-ink bg-brass px-5 py-4 font-evidence text-sm font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-paper">Run the desk</Link>
        </div>

        <div className="overflow-x-auto border border-ink/25 bg-paper-deep">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="font-evidence text-[0.65rem] uppercase tracking-[0.18em] text-ink/55">
              <tr>
                <th className="border-b border-ink/20 px-4 py-3">Case</th>
                <th className="border-b border-ink/20 px-4 py-3">Thesis</th>
                <th className="border-b border-ink/20 px-4 py-3">Verdict</th>
                <th className="border-b border-ink/20 px-4 py-3">Execution</th>
                <th className="border-b border-ink/20 px-4 py-3">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {samplePackets.map((item) => (
                <tr key={item.id} className="border-b border-ink/15 last:border-b-0">
                  <td className="px-4 py-4 font-evidence text-sm font-semibold text-ink">{item.id}<br />{item.asset} / {item.analyst.direction}</td>
                  <td className="px-4 py-4 text-sm leading-6 text-ink/70">{item.analyst.thesis}</td>
                  <td className="px-4 py-4"><span className={`stamp ${item.risk.verdict === "approved" ? "stamp-approved" : item.risk.verdict === "rejected" ? "stamp-reject" : "stamp-brass"}`}>{item.risk.verdict}</span></td>
                  <td className="px-4 py-4 font-evidence text-xs uppercase tracking-[0.12em] text-ink/70">{item.execution.status} · {item.execution.side}</td>
                  <td className="px-4 py-4 font-evidence text-xs uppercase tracking-[0.12em] text-approved">{item.outcome.status} · {item.outcome.pnlPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
