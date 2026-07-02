"use client";

import Link from "next/link";
import { useState } from "react";

const steps = [
  {
    eyebrow: "Step 1",
    title: "Pick an asset.",
    body: "Choose BTC, ETH, or SOL and set a bounded notional size. The desk treats that request as the start of a case file, not a loose prompt.",
  },
  {
    eyebrow: "Steps 2–3",
    title: "A thesis gets generated, then the risk agent challenges it.",
    body: "The analyst proposes direction, confidence, drivers, and invalidation. The risk agent then stamps approve, caution, or reject before any execution path opens.",
  },
  {
    eyebrow: "Steps 4–5",
    title: "The evidence packet gets recorded and the outcome gets tracked later.",
    body: "The packet stores source evidence, objections, SoDEX preparation status, and a public case file. Later, the case log records whether the call aged well.",
  },
];

function completeOnboarding() {
  if (typeof window !== "undefined") window.localStorage.setItem("verdictfi:onboarded", "true");
}

export default function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 py-10 sm:px-8 lg:px-12">
        <Link href="/" className="font-evidence text-xs uppercase tracking-[0.18em] text-ink underline decoration-brass underline-offset-4">← Back to pitch</Link>

        <section className="case-paper relative mt-14 border border-ink/25 p-6 md:p-10">
          <div className="case-tab absolute -top-8 left-0 bg-brass px-6 py-2 font-evidence text-xs font-bold uppercase tracking-[0.22em] text-ink">Desk orientation</div>
          <p className="font-evidence text-xs uppercase tracking-[0.35em] text-ink/55">{step.eyebrow}</p>
          <h1 className="font-display mt-4 max-w-3xl text-5xl font-black leading-none text-ink">{step.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/75">{step.body}</p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {steps.map((item, itemIndex) => (
              <button
                key={item.title}
                onClick={() => setIndex(itemIndex)}
                className={`border px-4 py-3 text-left font-evidence text-xs uppercase tracking-[0.16em] ${itemIndex === index ? "border-brass bg-brass text-ink" : "border-ink/25 bg-paper-deep text-ink/60"}`}
              >
                {item.eyebrow}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-paper-edge pt-6">
            {!isLast ? (
              <button onClick={() => setIndex(index + 1)} className="border-2 border-ink bg-brass px-5 py-4 font-evidence text-sm font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-paper">
                Next
              </button>
            ) : (
              <Link onClick={completeOnboarding} href="/desk" className="border-2 border-ink bg-brass px-5 py-4 font-evidence text-sm font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-paper">
                Enter the desk
              </Link>
            )}
            <Link onClick={completeOnboarding} href="/desk" className="border border-ink px-5 py-4 font-evidence text-sm font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-charcoal hover:text-paper">
              Skip orientation
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
