import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("VerdictFi case-file redesign tokens", () => {
  it("uses the required paper dossier palette and typography tokens", () => {
    const globals = read("src/app/globals.css");
    const layout = read("src/app/layout.tsx");

    for (const hex of ["#F1EDE4", "#1C1A17", "#2B2822", "#9C2B1F", "#2F5D3A", "#A9862F"]) {
      expect(globals).toContain(hex);
    }

    expect(layout).toContain("Source_Serif_4");
    expect(layout).toContain("IBM_Plex_Sans");
    expect(layout).toContain("IBM_Plex_Mono");
  });

  it("removes generic fintech dashboard defaults from app surfaces", () => {
    const files = [
      "src/app/page.tsx",
      "src/app/desk/page.tsx",
      "src/app/track-record/page.tsx",
      "src/app/packets/[id]/page.tsx",
    ];
    const combined = files.filter((file) => existsSync(path.join(root, file))).map(read).join("\n");

    expect(combined).not.toContain("bg-[#050816]");
    expect(combined).not.toContain("rounded-full");
    expect(combined).not.toContain("cyan");
    expect(combined).toContain("Case file");
    expect(combined).toContain("Case log");
    expect(combined).toContain("stamp");
  });

  it("keeps landing, onboarding, dashboard, packet, and track-record as distinct routes", () => {
    for (const file of [
      "src/app/page.tsx",
      "src/app/onboarding/page.tsx",
      "src/app/desk/page.tsx",
      "src/app/packets/[id]/page.tsx",
      "src/app/track-record/page.tsx",
    ]) {
      expect(existsSync(path.join(root, file)), `${file} should exist`).toBe(true);
    }

    const landing = read("src/app/page.tsx");
    expect(landing).toContain("Enter the desk");
    expect(landing).not.toContain("/api/run");
    expect(landing).not.toContain("Generate accountable signal");
  });
});
