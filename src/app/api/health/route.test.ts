import { mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

describe("GET /api/health", () => {
  it("returns production readiness status without leaking secrets", async () => {
    vi.resetModules();
    process.env["SOSOVALUE_API_KEY"] = "test-secret-value";
    process.env["VERDICTFI_DB_PATH"] = path.join(mkdtempSync(path.join(os.tmpdir(), "verdictfi-health-")), "health.sqlite");

    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toMatch(/ok|degraded/);
    expect(body.checks.database.status).toBe("ok");
    expect(body.checks.sosovalue.configured).toBe(true);
    expect(JSON.stringify(body)).not.toContain("test-secret-value");
  });
});
