import { checkDatabaseHealth, getDatabaseInfo } from "@/lib/db";

export const runtime = "nodejs";

function configured(name: string) {
  return Boolean(process.env[name]?.trim());
}

export async function GET() {
  const database = checkDatabaseHealth();
  const dbInfo = getDatabaseInfo();
  const checks = {
    database,
    sosovalue: {
      status: configured("SOSOVALUE_API_KEY") ? "ok" : "degraded",
      configured: configured("SOSOVALUE_API_KEY"),
    },
    sodex: {
      status: configured("SODEX_TESTNET_API_KEY") && configured("SODEX_TESTNET_PRIVATE_KEY") ? "ok" : "degraded",
      configured: configured("SODEX_TESTNET_API_KEY") && configured("SODEX_TESTNET_PRIVATE_KEY"),
    },
    storage: {
      status: "ok",
      type: dbInfo.type,
    },
  };
  const status = checks.database.status === "ok" ? "ok" : "degraded";

  return Response.json(
    {
      status,
      service: "verdictfi",
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: status === "ok" ? 200 : 503,
      headers: { "cache-control": "no-store" },
    },
  );
}
