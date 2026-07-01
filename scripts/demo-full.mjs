const base = process.env.VERDICTFI_URL || "http://localhost:3000";

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`VerdictFi demo run started: ${startedAt}`);
  for (const asset of ["BTC", "ETH", "SOL"]) {
    const response = await fetch(`${base}/api/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ asset, notionalUsd: asset === "BTC" ? 1000 : 750, riskMode: "balanced" }),
    });
    if (!response.ok) throw new Error(`API run failed for ${asset}: ${response.status}`);
    const packet = await response.json();
    console.log(`\n${asset} packet ${packet.id}`);
    console.log(`- analyst: ${packet.analyst.direction} @ ${packet.analyst.confidence}%`);
    console.log(`- risk: ${packet.risk.verdict} score=${packet.risk.riskScore}`);
    console.log(`- execution: ${packet.execution.status} order=${packet.execution.orderId}`);
    console.log(`- outcome: ${packet.outcome.status} pnl=${packet.outcome.pnlPct}%`);
  }
  const outcomes = await fetch(`${base}/api/outcomes`).then((res) => res.json());
  console.log(`\nTrack record: ${outcomes.correctSignals}/${outcomes.totalSignals} correct (${outcomes.winRatePct}%)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
