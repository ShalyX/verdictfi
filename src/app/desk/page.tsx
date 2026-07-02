"use client";

import { useState } from "react";
import Link from "next/link";
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
            <EvidenceTag label="EVIDENCE TAG / SODEX-ORDER" value={packet.execution.orderId} />
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
            <div className="inline-block border border-brass px-4 py-2 font-evidence text-xs uppercase tracking-[0.24em] text-brass">Case file VF-001 / Live desk</div>
            <h1 className="font-display mt-7 max-w-4xl text-5xl font-black leading-[0.95] sm:text-7xl">
              Run the desk.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-paper/78">
              Pick an asset, set notional size, and generate a risk-challenged evidence packet. This page is the live tool; the landing page stays pitch-only.
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

        <section className="border border-ink/25 bg-paper-deep p-5">
          <p className="font-evidence text-xs uppercase tracking-[0.35em] text-ink/55">Next records</p>
          <h2 className="font-display mt-2 text-3xl font-black text-ink">Generated packets open as public case files.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">
            The dashboard stays focused on running the desk. Use the case log for track record review, or open a generated packet once a signal is recorded.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/track-record" className="border-2 border-ink bg-brass px-5 py-4 font-evidence text-sm font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-paper">
              View case log
            </Link>
            <Link href="/onboarding" className="border border-ink px-5 py-4 font-evidence text-sm font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-charcoal hover:text-paper">
              Revisit flow
            </Link>
          </div>
        </section>
      </div>

      <footer className="bg-charcoal px-5 py-8 text-center text-sm text-paper/68">
        VerdictFi — built for the SoSoValue WaveHack. Live market data feeds evidence packets; approved SoDEX testnet cases submit when endpoint credentials are configured.
      </footer>
    </main>
  );
}
