import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
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

    expect(layout).toContain("Fraunces");
    expect(layout).toContain("IBM_Plex_Mono");
    expect(layout).toContain("Inter");
  });

  it("removes generic fintech dashboard defaults from app surfaces", () => {
    const page = read("src/app/page.tsx");
    const publicPacket = read("src/app/packets/[id]/page.tsx");
    const combined = `${page}\n${publicPacket}`;

    expect(combined).not.toContain("bg-[#050816]");
    expect(combined).not.toContain("rounded-full");
    expect(combined).not.toContain("cyan");
    expect(combined).toContain("Case file");
    expect(combined).toContain("Case log");
    expect(combined).toContain("stamp");
  });
});
