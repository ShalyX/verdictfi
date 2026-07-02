# VerdictFi Redesign Plan — Case File / Audit Dossier

## Goal
Move VerdictFi away from dark fintech-dashboard defaults and into an evidence-and-verdict system: paper dossier, stamped case file, audit log, and legal-document gravitas.

## Design tokens

### Color tokens — exact brief values
- `--paper: #F1EDE4` — body/page base, document surfaces.
- `--ink: #1C1A17` — primary body text and document outlines.
- `--charcoal: #2B2822` — header/footer bands and dark evidence strips.
- `--reject: #9C2B1F` — rejected / blocked stamp and warning rules.
- `--approved: #2F5D3A` — approved stamp and positive outcomes.
- `--brass: #A9862F` — verdict seals, folder tab accent, divider marks.

### Derived neutral tokens
- `--paper-deep: #E4DCCA` — inset paper panels / row alternation.
- `--paper-edge: #D1C5AE` — document borders and file dividers.
- `--ink-muted: rgba(28, 26, 23, 0.68)` — body secondary.
- `--stamp-fade: rgba(156, 43, 31, 0.1)` — rejected stamp tint.
- `--approved-fade: rgba(47, 93, 58, 0.1)` — approved stamp tint.

### Typography
- Display: `Fraunces` via `next/font/google`, variable `--font-display`.
- Body: `Inter` via `next/font/google`, variable `--font-body`.
- Evidence/data: `IBM Plex Mono` via `next/font/google`, variable `--font-evidence`.

## Layout plan

### 1. Global shell
- Replace `bg-[#050816]`, cyan gradients, and glassmorphism with a paper document texture.
- Use top and footer charcoal bands, not a floating pill nav.
- Header language: “Case file VF-001” and “Evidence-led AI market verdicts.”

### 2. Signature evidence packet component
- Rename visual mental model from `PacketCard` dashboard card to case file dossier.
- Add folder tab: brass strip reading `EVIDENCE PACKET` / packet id.
- Use a stamped verdict graphic instead of status pills:
  - rotated uppercase bordered block
  - reject red / approved green / brass for caution/prepared
  - no `rounded-full` styling
- Format SoDEX order id as an evidence tag:
  - mono label `EVIDENCE TAG / SODEX-PREP`
  - perforated left edge or ruled label styling
  - break-all mono value

### 3. Controls panel
- Replace glowing “Run the desk” card with “Open a case” intake form.
- Controls look like file-room form fields: square corners, ink borders, mono labels.
- Button reads “Generate accountable signal” but visually acts like a case action stamp.

### 4. Step 1–4 sequence
- Keep sequence exactly, but convert to case timeline.
- Vertical/horizontal ruled line, numbered tabs, brass dots/markers.
- Copy stays procedural: data intake → analyst thesis → risk verdict → outcome entry.

### 5. Track record
- Rename visually as “Case log.”
- Avoid leaderboard/card grid.
- Use ledger/table rows with case id, asset, verdict, execution, outcome, P/L.
- Use mono labels and ruled separators.

### 6. Public packet page
- Match the dossier style, not the old dark dashboard.
- Public packet gets top file tab, stamp, audit trail, source evidence, raw JSON in paper/charcoal evidence block.

## Anti-default audit before build

Must remove/fix:
- Dark navy/cyan fintech palette: **replace all primary page dark/cyan surfaces with paper/ink/brass/charcoal.**
- Pill status badges: **remove `rounded-full` badges; statuses become stamped verdict blocks or evidence tags.**
- Uniform rounded grid cards: **introduce folder tabs, ruled ledger rows, stamps, dossier panels, and case timeline.**
- Generic sans: **Fraunces headlines + IBM Plex Mono labels/data + Inter body.**
- Trading terminal vibe: **rename sections toward evidence, case file, audit trail, case log; no leaderboard framing.**

## Files to change
- `src/app/layout.tsx` — load Fraunces, Inter, IBM Plex Mono; update metadata if needed.
- `src/app/globals.css` — design tokens, paper texture, stamp/evidence utility classes.
- `src/app/page.tsx` — redesign dashboard into case intake + dossier + case timeline + case log.
- `src/app/packets/[id]/page.tsx` — redesign public packet page.
- `tests/e2e/verdictfi.spec.ts` — keep user flow assertion and add case-file visual language assertions.
- Add a small static design-token test to prevent regression to old palette/pill patterns.

## Validation plan
1. Static test must confirm exact hex palette appears in CSS and old `bg-[#050816]` / cyan pill pattern is absent from app UI files.
2. E2E must confirm homepage shows “Case file”, “Evidence Packet”, and “Case log”.
3. E2E must still generate a packet and open a public packet page.
4. Run `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e`.
5. Start local server and visually inspect screenshot for paper dossier style.

## Brief compliance check
- Palette exact? planned exact values: yes.
- Typography exact? Fraunces / IBM Plex Mono / Inter planned: yes.
- Evidence packet as signature element? yes, dossier + folder tab + stamp.
- Kill pill badges? yes, stamp/evidence-tag components only.
- Kill uniform card grid? yes, mixed dossier/timeline/ledger structures.
- Keep Step 1–4? yes, converted to case timeline.
- Case file/audit dossier instead of trading terminal? yes.
