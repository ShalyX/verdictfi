import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns production readiness status without leaking secrets", async () => {
    process.env["SOSOVALUE_API_KEY"] = "test-secret-value";
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toMatch(/ok|degraded/);
    expect(body.checks.database.status).toBe("ok");
    expect(body.checks.sosovalue.configured).toBe(true);
    expect(JSON.stringify(body)).not.toContain("test-secret-value");
  });
});
