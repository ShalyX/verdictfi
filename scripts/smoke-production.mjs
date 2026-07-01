const baseUrl = process.env.VERDICTFI_URL || "http://localhost:3000";

async function readJson(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${path} returned non-JSON status=${response.status}: ${text.slice(0, 200)}`);
  }
  if (!response.ok) throw new Error(`${path} failed status=${response.status}: ${JSON.stringify(json).slice(0, 500)}`);
  return json;
}

console.log(`VerdictFi production smoke: ${baseUrl}`);

const health = await readJson("/api/health");
console.log(`health=${health.status} database=${health.checks?.database?.status} sosovalueConfigured=${health.checks?.sosovalue?.configured}`);

const packet = await readJson("/api/run", {
  method: "POST",
  headers: { "content-type": "application/json", "x-forwarded-for": `smoke-${Date.now()}` },
  body: JSON.stringify({ asset: "BTC", notionalUsd: 1000, riskMode: "balanced" }),
});
console.log(`packet=${packet.id} mode=${packet.mode} adapter=${packet.adapter?.provider}/${packet.adapter?.mode} risk=${packet.risk?.verdict}`);

const persisted = await readJson(`/api/packets/${packet.id}`);
if (persisted.id !== packet.id) throw new Error("persisted packet lookup returned wrong id");
console.log(`persisted=${persisted.id}`);
console.log("smoke=ok");
