"use client";

import { useMemo, useState } from "react";
import { samplePackets, type AssetSymbol, type EvidencePacket } from "@/lib/verdict";

const assets: AssetSymbol[] = ["BTC", "ETH", "SOL"];

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "green" | "red" | "amber" | "blue" | "slate" }) {
  const classes = {
    green: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    red: "border-rose-400/40 bg-rose-400/10 text-rose-200",
    amber: "border-amber-400/40 bg-amber-400/10 text-amber-100",
    blue: "border-cyan-400/40 bg-cyan-400/10 text-cyan-100",
    slate: "border-white/15 bg-white/8 text-slate-200",
  }[tone];
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${classes}`}>{children}</span>;
}

function PacketCard({ packet, saved = false }: { packet: EvidencePacket; saved?: boolean }) {
  const riskTone = packet.risk.verdict === "approved" ? "green" : packet.risk.verdict === "caution" ? "amber" : "red";
  const executionTone = packet.execution.status === "submitted" ? "green" : packet.execution.status === "prepared" ? "blue" : "red";

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
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">Evidence Packet</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{packet.asset} · {packet.analyst.direction.toUpperCase()} thesis</h2>
          <p className="mt-2 max-w-2xl text-slate-300">{packet.analyst.thesis}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="blue">{packet.analyst.confidence}% confidence</Badge>
          <Badge tone={riskTone}>{packet.risk.verdict}</Badge>
          <Badge tone={packet.mode === "live" ? "green" : "slate"}>{packet.mode} mode</Badge>
          <button onClick={copyPacket} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100 transition hover:bg-white/20">
            Copy JSON
          </button>
          <button onClick={downloadPacket} className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-300/20">
            Download packet
          </button>
          {saved ? (
            <a href={`/packets/${packet.id}`} className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 transition hover:bg-emerald-300/20">
              Public packet
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs text-slate-400">Market price</p>
          <p className="mt-1 text-2xl font-bold text-white">{formatUsd(packet.market.price)}</p>
          <p className="text-sm text-cyan-200">{packet.market.priceChange24hPct}% 24h</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs text-slate-400">ETF/news flow</p>
          <p className="mt-1 text-2xl font-bold text-white">{formatUsd(packet.market.etfFlowUsd)}</p>
          <p className="text-sm text-cyan-200">sentiment {packet.market.newsSentiment}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs text-slate-400">Risk score</p>
          <p className="mt-1 text-2xl font-bold text-white">{packet.risk.riskScore}/100</p>
          <p className="text-sm text-cyan-200">vol {packet.market.realizedVolatilityPct}%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs text-slate-400">Outcome</p>
          <p className="mt-1 text-2xl font-bold text-white">{packet.outcome.status}</p>
          <p className="text-sm text-cyan-200">P/L {packet.outcome.pnlPct}%</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h3 className="font-semibold text-white">Analyst drivers</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {packet.analyst.drivers.map((driver) => <li key={driver}>• {driver}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h3 className="font-semibold text-white">Risk challenge</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {packet.risk.objections.map((objection) => <li key={objection}>• {objection}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-white">SoDEX execution</h3>
            <Badge tone={executionTone}>{packet.execution.status}</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-300">{packet.execution.note}</p>
          <p className="mt-3 break-all rounded-xl bg-black/30 p-3 font-mono text-xs text-cyan-100">{packet.execution.orderId}</p>
        </div>
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
    <main className="min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.2),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0),#050816_75%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-cyan-300 font-black text-slate-950">VF</div>
            <div>
              <p className="font-bold text-white">VerdictFi</p>
              <p className="text-xs text-slate-400">Accountable finance desk</p>
            </div>
          </div>
          <Badge tone="blue">SoSoValue × SoDEX</Badge>
        </nav>

        <header className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge tone="green">explainable • risk-checked • outcome-tracked</Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-7xl">
              A one-person finance desk where every AI market call gets a verdict.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              VerdictFi turns SoSoValue market intelligence into trade theses, forces each thesis through a risk challenge, records the evidence packet, prepares SoDEX testnet execution, and tracks whether the call was right later.
            </p>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.08] p-6 shadow-2xl shadow-cyan-950/40">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/80">Run the desk</p>
            <div className="mt-5 grid gap-4">
              <label className="text-sm text-slate-300">Asset
                <select value={asset} onChange={(event) => setAsset(event.target.value as AssetSymbol)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
                  {assets.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-sm text-slate-300">Notional USD
                <input type="number" min="100" step="50" value={notionalUsd} onChange={(event) => setNotionalUsd(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <button onClick={runDesk} disabled={isRunning} className="rounded-2xl bg-cyan-300 px-5 py-4 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60">
                {isRunning ? "Running analyst + risk agents..." : "Generate accountable signal"}
              </button>
            </div>
          </div>
        </header>

        <PacketCard packet={packet} saved={isPacketSaved} />

        <section className="grid gap-4 lg:grid-cols-4">
          {[
            ["1", "SoSoValue data in", "Market, ETF/news flow, sentiment and SSI-style momentum are captured with timestamps."],
            ["2", "AI analyst thesis", "The analyst proposes direction, confidence, drivers, horizon and invalidation rule."],
            ["3", "Risk agent verdict", "The challenger can approve, caution or reject before any execution path opens."],
            ["4", "Outcome tracker", "Every signal gets later scored as correct, wrong, neutral or avoided-loss."],
          ].map(([step, title, body]) => (
            <div key={step} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
              <p className="text-sm text-cyan-200">Step {step}</p>
              <h3 className="mt-2 text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">Track record</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Signals are accountable after the demo click.</h2>
            </div>
            <Badge tone="green">{trackRecord.filter((item) => item.outcome.status === "correct").length}/{trackRecord.length} correct demo calls</Badge>
          </div>
          <div className="mt-6 grid gap-3">
            {trackRecord.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[0.7fr_1.4fr_0.8fr_0.8fr] md:items-center">
                <div className="font-bold text-white">{item.asset} {item.analyst.direction}</div>
                <div className="text-sm text-slate-300">{item.analyst.thesis}</div>
                <div className="text-sm text-cyan-100">{item.execution.status} · {item.execution.side}</div>
                <div className="text-sm text-emerald-200">{item.outcome.status} · {item.outcome.pnlPct}%</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="pb-8 text-center text-sm text-slate-500">
          VerdictFi — built for the SoSoValue WaveHack. Demo mode uses deterministic adapters; live API and SoDEX testnet credentials plug into the same flow.
        </footer>
      </div>
    </main>
  );
}
