import { describe, expect, it } from "vitest";
import { challengeThesis, createEvidencePacket, executeOnSodexTestnet, generateAnalystThesis } from "./verdict";
import { buildDemoMarketSnapshot } from "./sosovalue";

describe("VerdictFi core engine", () => {
  it("generates an approved BTC thesis from demo SoSoValue data", () => {
    const market = buildDemoMarketSnapshot("BTC");
    const thesis = generateAnalystThesis(market);
    const risk = challengeThesis(market, thesis, 1000);

    expect(thesis.direction).toBe("long");
    expect(thesis.confidence).toBeGreaterThanOrEqual(68);
    expect(risk.verdict).toBe("approved");
  });

  it("downgrades large notional into caution", () => {
    const market = buildDemoMarketSnapshot("BTC");
    const thesis = generateAnalystThesis(market);
    const risk = challengeThesis(market, thesis, 3000);

    expect(risk.verdict).toBe("caution");
    expect(risk.objections.join(" ")).toMatch(/notional/i);
  });

  it("blocks SoDEX execution when risk rejects", () => {
    const packet = createEvidencePacket({ asset: "SOL", notionalUsd: 500, riskMode: "strict" });
    const execution = executeOnSodexTestnet(packet.asset, packet.analyst, packet.risk, packet.request.notionalUsd);

    expect(packet.risk.verdict).toBe("rejected");
    expect(execution.status).toBe("blocked");
    expect(execution.orderId).toBe("not-submitted-risk-gate");
  });

  it("creates a complete evidence packet", () => {
    const packet = createEvidencePacket({ asset: "ETH", notionalUsd: 750, riskMode: "balanced" });

    expect(packet.id).toMatch(/^vf-/);
    expect(packet.market.sources.length).toBeGreaterThan(0);
    expect(packet.auditTrail.length).toBe(5);
    expect(packet.outcome.status).toMatch(/correct|wrong|neutral|avoided-loss/);
  });
});
