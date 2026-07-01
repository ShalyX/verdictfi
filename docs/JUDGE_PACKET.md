# VerdictFi Judge Packet

## One-liner

VerdictFi is a one-person finance desk where every AI market call is explainable, risk-checked, execution-gated, and outcome-tracked.

## User value

Crypto traders do not just need another signal. They need to know:

- what data produced the call,
- why the agent believes it,
- what could make it wrong,
- whether the risk desk approves it,
- whether execution was blocked or prepared,
- whether the call worked later.

## Demo path

1. Open dashboard.
2. Pick BTC, ETH, or SOL.
3. Generate accountable signal.
4. Read analyst thesis.
5. Read risk agent objections.
6. Inspect evidence packet details.
7. Check SoDEX testnet adapter status.
8. Review track record.

## Rubric mapping

- **User Value & Practical Impact (30%)**: focuses on decision quality and post-signal accountability, not generic alerts.
- **Functionality & Working Demo (25%)**: full local dashboard + API routes + deterministic demo packet generation.
- **Logic, Workflow & Product Design (20%)**: explicit data → thesis → challenge → evidence → execution gate → outcome pipeline.
- **Data/API Integration (15%)**: SoSoValue live-data adapter and SoDEX preparation adapter are isolated so venue submission can be added without changing the product flow.
- **UX & Clarity (10%)**: judge-readable dashboard with visible verdicts, risks, execution status, and outcomes.

## Current limitation

Live SoSoValue mode requires an API key. Live SoDEX order submission is intentionally disabled until a verified submit adapter, key-management controls, and compliance review are complete. The app clearly labels execution as `prepared` or `blocked`, not fake-submitted.
