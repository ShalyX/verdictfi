"use client";

import { useMemo, useState } from "react";
import { samplePackets, type AssetSymbol, type EvidencePacket } from "@/lib/verdict";

const assets: AssetSymbol[] = ["BTC", "ETH", "SOL"];

type StampTone = "approved" | "reject" | "brass" | "ink";

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function stampToneFor(packet: EvidencePacket): StampTone {
  if (packet.risk.verdict === "approved") return "approved";
  if (packet.risk.verdict === "rejected" || packet.execution.status === "blocked") return "reject";
  return "brass";
}

function Stamp({ children, tone = "ink" }: { children: React.ReactNode; tone?: StampTone }) {
  const toneClass = {
    approved: "stamp-approved",
    reject: "stamp-reject",
    brass: "stamp-brass",
    ink: "stamp-ink",
  }[tone];
  return <span className={`stamp ${toneClass}`}>{children}</span>;
}

function EvidenceTag({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="evidence-tag">
      <p className="font-evidence text-[0.62rem] uppercase tracking-[0.22em] text-ink/60">{label}</p>
      <div className="mt-1 break-all text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function DossierMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="border-l-2 border-brass bg-paper-deep/70 px-4 py-3">
      <p className="font-evidence text-[0.62rem] uppercase tracking-[0.22em] text-ink/55">{label}</p>
      <p className="font-display mt-1 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink/65">{note}</p>
    </div>
  );
}

function PacketDossier({ packet, saved = false }: { packet: EvidencePacket; saved?: boolean }) {
  const stampTone = stampToneFor(packet);

  function downloadPacket() {
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${packet.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copyPacket() {
    await navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
  }

  return (
    <section className="case-paper relative border border-ink/25 p-0">
      <div className="case-tab absolute -top-8 left-0 bg-brass px-6 py-2 font-evidence text-xs font-bold uppercase tracking-[0.22em] text-ink">
        Evidence Packet / {packet.id}
      </div>

      <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <p className="font-evidence text-xs uppercase tracking-[0.35em] text-ink/55">Case file signature exhibit</p>
          <h2 className="font-display mt-3 text-4xl font-black leading-none text-ink sm:text-5xl">
            {packet.asset} · {packet.analyst.direction.toUpperCase()} thesis
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/75">{packet.analyst.thesis}</p>
        </div>

        <aside className="flex flex-col items-start gap-4 border-l border-paper-edge pl-0 md:pl-6">
          <Stamp tone={stampTone}>{packet.risk.verdict}</Stamp>
          <EvidenceTag label="Mode of record" value={`${packet.mode.toUpperCase()} DATA`} />
          <EvidenceTag label="Confidence" value={`${packet.analyst.confidence}%`} />
        </aside>
      </div>

      <div className="grid border-y border-paper-edge bg-paper-deep/60 md:grid-cols-4">
        <DossierMetric label="Market price" value={formatUsd(packet.market.price)} note={`${packet.market.priceChange24hPct}% over 24h`} />
        <DossierMetric label="ETF / news flow" value={formatUsd(packet.market.etfFlowUsd)} note={`sentiment ${packet.market.newsSentiment}`} />
        <DossierMetric label="Risk score" value={`${packet.risk.riskScore}/100`} note={`volatility ${packet.market.realizedVolatilityPct}%`} />
        <DossierMetric label="Outcome" value={packet.outcome.status.toUpperCase()} note={`P/L ${packet.outcome.pnlPct}%`} />
      </div>

      <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1fr_1fr_1.1fr]">
        <section>
          <h3 className="font-display text-2xl font-semibold text-ink">Analyst evidence</h3>
          <ul className="ruled-list mt-3 text-sm leading-6 text-ink/75">
            {packet.analyst.drivers.map((driver) => <li key={driver} className="py-2">{driver}</li>)}
          </ul>
        </section>
        <section>
          <h3 className="font-display text-2xl font-semibold text-ink">Risk objections</h3>
          <ul className="ruled-list mt-3 text-sm leading-6 text-ink/75">
            {packet.risk.objections.map((objection) => <li key={objection} className="py-2">{objection}</li>)}
          </ul>
        </section>
        <section className="border border-ink/30 bg-paper-deep p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-2xl font-semibold text-ink">SoDEX evidence tag</h3>
            <Stamp tone={packet.execution.status === "blocked" ? "reject" : "brass"}>{packet.execution.status}</Stamp>
          </div>
          <p className="mt-4 text-sm leading-6 text-ink/75">{packet.execution.note}</p>
          <div className="mt-4">
            <EvidenceTag label="EVIDENCE TAG / SODEX-PREP" value={packet.execution.orderId} />
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-paper-edge bg-charcoal px-6 py-4 md:px-8">
        <button onClick={copyPacket} className="border border-paper px-4 py-2 font-evidence text-xs font-semibold uppercase tracking-[0.18em] text-paper transition hover:bg-paper hover:text-charcoal">
          Copy JSON
        </button>
        <button onClick={downloadPacket} className="border border-brass bg-brass px-4 py-2 font-evidence text-xs font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-paper">
          Download packet
        </button>
        {saved ? (
          <a href={`/packets/${packet.id}`} className="border border-paper px-4 py-2 font-evidence text-xs font-semibold uppercase tracking-[0.18em] text-paper transition hover:bg-paper hover:text-charcoal">
            Public packet
          </a>
        ) : null}
      </div>
    </section>
  );
}

export default function Home() {
  const [asset, setAsset] = useState<AssetSymbol>("BTC");
  const [notionalUsd, setNotionalUsd] = useState(1000);
  const [packet, setPacket] = useState<EvidencePacket>(samplePackets[0]);
  const [isPacketSaved, setIsPacketSaved] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const trackRecord = useMemo(() => samplePackets, []);

  async function runDesk() {
    setIsRunning(true);
    const response = await fetch("/api/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ asset, notionalUsd, riskMode: "balanced" }),
    });
    const nextPacket = (await response.json()) as EvidencePacket;
    setPacket(nextPacket);
    setIsPacketSaved(true);
    setIsRunning(false);
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="bg-charcoal text-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-14">
          <div>
            <div className="inline-block border border-brass px-4 py-2 font-evidence text-xs uppercase tracking-[0.24em] text-brass">Case file VF-001</div>
            <h1 className="font-display mt-7 max-w-4xl text-5xl font-black leading-[0.95] sm:text-7xl">
              A one-person finance desk where every AI market call gets a verdict.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-paper/78">
              VerdictFi treats each signal like a case file: SoSoValue evidence enters, an analyst thesis is challenged, a verdict is stamped, and the outcome is logged after the fact.
            </p>
          </div>

          <section className="border border-brass bg-paper p-5 text-ink shadow-2xl shadow-black/30">
            <p className="font-evidence text-xs uppercase tracking-[0.28em] text-ink/60">Open a case</p>
            <div className="mt-5 grid gap-4">
              <label className="font-evidence text-xs uppercase tracking-[0.2em] text-ink/65">Asset
                <select value={asset} onChange={(event) => setAsset(event.target.value as AssetSymbol)} className="mt-2 w-full border border-ink bg-paper-deep px-4 py-3 font-sans text-base text-ink outline-none focus:border-brass">
                  {assets.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="font-evidence text-xs uppercase tracking-[0.2em] text-ink/65">Notional USD
                <input type="number" min="100" step="50" value={notionalUsd} onChange={(event) => setNotionalUsd(Number(event.target.value))} className="mt-2 w-full border border-ink bg-paper-deep px-4 py-3 font-sans text-base text-ink outline-none focus:border-brass" />
              </label>
              <button onClick={runDesk} disabled={isRunning} className="border-2 border-ink bg-brass px-5 py-4 font-evidence text-sm font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-paper disabled:opacity-60">
                {isRunning ? "Running analyst + risk agents..." : "Generate accountable signal"}
              </button>
            </div>
          </section>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-5 py-16 sm:px-8 lg:px-12">
        <PacketDossier packet={packet} saved={isPacketSaved} />

        <section aria-labelledby="case-timeline" className="border-y border-ink/30 py-10">
          <p className="font-evidence text-xs uppercase tracking-[0.35em] text-ink/55">Case timeline</p>
          <h2 id="case-timeline" className="font-display mt-2 text-4xl font-black text-ink">Step 1–4: from evidence intake to outcome entry.</h2>
          <div className="mt-8 grid gap-0 border border-ink/25 bg-paper-deep lg:grid-cols-4">
            {[
              ["1", "SoSoValue data in", "Market, ETF/news flow, sentiment and SSI-style momentum are captured with timestamps."],
              ["2", "AI analyst thesis", "The analyst proposes direction, confidence, drivers, horizon and invalidation rule."],
              ["3", "Risk agent verdict", "The challenger can approve, caution or reject before any execution path opens."],
              ["4", "Outcome tracker", "Every signal gets later scored as correct, wrong, neutral or avoided-loss."],
            ].map(([step, title, body]) => (
              <article key={step} className="relative border-ink/20 p-5 lg:border-r last:border-r-0">
                <div className="mb-5 inline-grid size-10 place-items-center border-2 border-brass bg-paper font-evidence font-bold text-brass">{step}</div>
                <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/70">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="case-log" className="border border-ink/25 bg-paper-deep">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/25 bg-charcoal px-5 py-5 text-paper">
            <div>
              <p className="font-evidence text-xs uppercase tracking-[0.35em] text-brass">Case log</p>
              <h2 id="case-log" className="font-display mt-2 text-3xl font-black">Signals are accountable after the demo click.</h2>
            </div>
            <Stamp tone="brass">{trackRecord.filter((item) => item.outcome.status === "correct").length}/{trackRecord.length} correct</Stamp>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="font-evidence text-[0.65rem] uppercase tracking-[0.18em] text-ink/55">
                <tr>
                  <th className="border-b border-ink/20 px-4 py-3">Case</th>
                  <th className="border-b border-ink/20 px-4 py-3">Thesis</th>
                  <th className="border-b border-ink/20 px-4 py-3">Execution</th>
                  <th className="border-b border-ink/20 px-4 py-3">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {trackRecord.map((item) => (
                  <tr key={item.id} className="border-b border-ink/15 last:border-b-0">
                    <td className="px-4 py-4 font-evidence text-sm font-semibold text-ink">{item.asset} / {item.analyst.direction}</td>
                    <td className="px-4 py-4 text-sm leading-6 text-ink/70">{item.analyst.thesis}</td>
                    <td className="px-4 py-4 font-evidence text-xs uppercase tracking-[0.12em] text-ink/70">{item.execution.status} · {item.execution.side}</td>
                    <td className="px-4 py-4 font-evidence text-xs uppercase tracking-[0.12em] text-approved">{item.outcome.status} · {item.outcome.pnlPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="bg-charcoal px-5 py-8 text-center text-sm text-paper/68">
        VerdictFi — built for the SoSoValue WaveHack. Live market data feeds evidence packets; SoDEX submission remains intentionally gated until verified.
      </footer>
    </main>
  );
}
