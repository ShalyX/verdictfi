import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import type { EvidencePacket } from "./verdict";

const dataDir = path.join(process.cwd(), ".data");
const dbPath = process.env["VERDICTFI_DB_PATH"] || path.join(dataDir, "verdictfi.sqlite");

export function getDatabaseInfo() {
  return {
    path: dbPath,
    type: "sqlite",
  };
}

let db: Database.Database | undefined;

function getDb() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  if (!db) {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS evidence_packets (
        id TEXT PRIMARY KEY,
        asset TEXT NOT NULL,
        mode TEXT NOT NULL,
        created_at TEXT NOT NULL,
        risk_verdict TEXT NOT NULL,
        execution_status TEXT NOT NULL,
        outcome_status TEXT NOT NULL,
        packet_json TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_evidence_packets_created_at ON evidence_packets(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_evidence_packets_asset ON evidence_packets(asset);
    `);
  }
  return db;
}

export function saveEvidencePacket(packet: EvidencePacket) {
  getDb()
    .prepare(`
      INSERT OR REPLACE INTO evidence_packets
      (id, asset, mode, created_at, risk_verdict, execution_status, outcome_status, packet_json)
      VALUES (@id, @asset, @mode, @createdAt, @riskVerdict, @executionStatus, @outcomeStatus, @packetJson)
    `)
    .run({
      id: packet.id,
      asset: packet.asset,
      mode: packet.mode,
      createdAt: packet.createdAt,
      riskVerdict: packet.risk.verdict,
      executionStatus: packet.execution.status,
      outcomeStatus: packet.outcome.status,
      packetJson: JSON.stringify(packet),
    });
  return packet;
}

export function getEvidencePacket(id: string): EvidencePacket | null {
  const row = getDb().prepare("SELECT packet_json FROM evidence_packets WHERE id = ?").get(id) as { packet_json: string } | undefined;
  return row ? (JSON.parse(row.packet_json) as EvidencePacket) : null;
}

export function listEvidencePackets(limit = 25): EvidencePacket[] {
  const rows = getDb()
    .prepare("SELECT packet_json FROM evidence_packets ORDER BY created_at DESC LIMIT ?")
    .all(limit) as { packet_json: string }[];
  return rows.map((row) => JSON.parse(row.packet_json) as EvidencePacket);
}

export function checkDatabaseHealth() {
  try {
    const result = getDb().prepare("SELECT 1 AS ok").get() as { ok: number } | undefined;
    return { status: result?.ok === 1 ? "ok" : "degraded", type: "sqlite" };
  } catch {
    return { status: "degraded", type: "sqlite" };
  }
}

export function clearEvidencePacketsForTests() {
  getDb().prepare("DELETE FROM evidence_packets").run();
}
