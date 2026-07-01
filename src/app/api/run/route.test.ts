import { beforeEach, describe, expect, it } from "vitest";
import { resetRateLimiterForTests } from "@/lib/rate-limit";
import { GET, POST } from "./route";

describe("/api/run", () => {
  beforeEach(() => {
    resetRateLimiterForTests();
    delete process.env["VERDICTFI_RATE_LIMIT_MAX"];
    delete process.env["VERDICTFI_RATE_LIMIT_WINDOW_MS"];
    delete process.env["VERDICTFI_TRUST_PROXY_HEADERS"];
  });

  it("rejects side-effecting GET packet generation", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(405);
    expect(body.error).toBe("method_not_allowed");
  });

  it("rejects invalid assets", async () => {
    const request = new Request("http://localhost/api/run", {
      method: "POST",
      body: JSON.stringify({ asset: "DOGE", notionalUsd: 1000 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "validation_error" });
  });

  it("rejects unsafe notional sizes at the API boundary", async () => {
    const request = new Request("http://localhost/api/run", {
      method: "POST",
      body: JSON.stringify({ asset: "BTC", notionalUsd: 1_000_000_000, riskMode: "balanced" }),
    });

    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe("validation_error");
    expect(JSON.stringify(body.details)).toMatch(/notionalUsd/i);
  });

  it("does not trust spoofable forwarding headers by default", async () => {
    process.env["VERDICTFI_RATE_LIMIT_MAX"] = "1";
    process.env["VERDICTFI_RATE_LIMIT_WINDOW_MS"] = "60000";
    const body = JSON.stringify({ asset: "BTC", notionalUsd: 1000, riskMode: "balanced" });

    expect(
      (
        await POST(
          new Request("http://localhost/api/run", {
            method: "POST",
            headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.10" },
            body,
          }),
        )
      ).status,
    ).toBe(200);

    const spoofed = await POST(
      new Request("http://localhost/api/run", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.11" },
        body,
      }),
    );
    expect(spoofed.status).toBe(429);
  });

  it("rate limits repeated packet generation requests by trusted client IP", async () => {
    process.env["VERDICTFI_TRUST_PROXY_HEADERS"] = "true";
    process.env["VERDICTFI_RATE_LIMIT_MAX"] = "2";
    process.env["VERDICTFI_RATE_LIMIT_WINDOW_MS"] = "60000";
    const init = {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.10" },
      body: JSON.stringify({ asset: "BTC", notionalUsd: 1000, riskMode: "balanced" }),
    };

    expect((await POST(new Request("http://localhost/api/run", init))).status).toBe(200);
    expect((await POST(new Request("http://localhost/api/run", init))).status).toBe(200);

    const limited = await POST(new Request("http://localhost/api/run", init));
    const responseBody = await limited.json();
    expect(limited.status).toBe(429);
    expect(responseBody.error).toBe("rate_limited");
  });

  it("returns and persists a valid packet without claiming unimplemented SoDEX submission", async () => {
    process.env["SODEX_TESTNET_API_KEY"] = "configured";
    process.env["SODEX_TESTNET_PRIVATE_KEY"] = "configured";
    const request = new Request("http://localhost/api/run", {
      method: "POST",
      body: JSON.stringify({ asset: "BTC", notionalUsd: 1000, riskMode: "balanced" }),
    });

    const response = await POST(request);
    const packet = await response.json();
    expect(response.status).toBe(200);
    expect(packet.asset).toBe("BTC");
    expect(packet.adapter.provider).toBe("SoSoValue");
    expect(packet.execution.status).toMatch(/prepared|blocked/);
    expect(packet.execution.status).not.toBe("submitted");
  });
});
