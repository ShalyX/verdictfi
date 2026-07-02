import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="bg-charcoal text-paper">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="font-display text-2xl font-black">VerdictFi</Link>
            <div className="flex flex-wrap gap-3 font-evidence text-xs uppercase tracking-[0.18em] text-paper/70">
              <Link href="/track-record" className="hover:text-brass">Case log</Link>
              <Link href="/onboarding" className="hover:text-brass">How it works</Link>
            </div>
          </nav>

          <section className="grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <div className="inline-block border border-brass px-4 py-2 font-evidence text-xs uppercase tracking-[0.24em] text-brass">Case file finance agent</div>
              <h1 className="font-display mt-7 max-w-4xl text-5xl font-black leading-[0.95] sm:text-7xl">
                Verdicts you can audit, not signals you have to trust.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-paper/78">
                VerdictFi turns market intelligence into a recorded evidence packet: the thesis, objections, risk verdict, prepared execution record, and later outcome all stay attached to the same case file.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/onboarding" className="border-2 border-brass bg-brass px-5 py-4 font-evidence text-sm font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-paper">
                  Enter the desk
                </Link>
                <Link href="/track-record" className="border border-paper px-5 py-4 font-evidence text-sm font-bold uppercase tracking-[0.18em] text-paper transition hover:bg-paper hover:text-charcoal">
                  View case log
                </Link>
              </div>
            </div>

            <aside className="case-paper relative border border-ink/25 p-6 text-ink">
              <div className="case-tab absolute -top-8 left-0 bg-brass px-6 py-2 font-evidence text-xs font-bold uppercase tracking-[0.22em] text-ink">Evidence packet preview</div>
              <p className="font-evidence text-xs uppercase tracking-[0.35em] text-ink/55">Why it matters</p>
              <h2 className="font-display mt-3 text-4xl font-black leading-tight">Every AI call leaves a paper trail.</h2>
              <ul className="ruled-list mt-5 text-sm leading-6 text-ink/75">
                <li className="py-3">The signal is tied to source evidence instead of detached model output.</li>
                <li className="py-3">A risk agent challenges the thesis before execution is even prepared.</li>
                <li className="py-3">Blocked, prepared, and approved states are stamped as verdicts, not hidden in dashboard badges.</li>
                <li className="py-3">The case log tracks whether the call aged well after the demo click.</li>
              </ul>
            </aside>
          </section>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8 lg:grid-cols-3 lg:px-12">
        {[
          ["Evidence first", "VerdictFi makes the evidence packet the product artifact: source data, thesis, risk challenge, execution status, and outcome."],
          ["Verdict before action", "The risk challenge can approve, caution, or reject. Real-capital execution stays gated until verified controls exist."],
          ["Accountability after", "Signals are scored later in the case log, so the agent is judged by outcomes instead of confident language."],
        ].map(([title, body]) => (
          <article key={title} className="border border-ink/25 bg-paper-deep p-5">
            <h3 className="font-display text-2xl font-bold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-ink/70">{body}</p>
          </article>
        ))}
      </section>

      <section className="bg-charcoal px-5 py-12 text-center text-paper sm:px-8 lg:px-12">
        <p className="font-evidence text-xs uppercase tracking-[0.35em] text-brass">Ready to open the file?</p>
        <h2 className="font-display mx-auto mt-3 max-w-3xl text-4xl font-black">See the sequence once, then enter the live desk.</h2>
        <Link href="/onboarding" className="mt-8 inline-block border-2 border-brass bg-brass px-5 py-4 font-evidence text-sm font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-paper">
          Enter the desk
        </Link>
      </section>
    </main>
  );
}
