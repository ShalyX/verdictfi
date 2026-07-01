# AKINDO Submission Copy — VerdictFi

## Project name

VerdictFi

## Short description

A one-person finance desk where every AI market call is explainable, risk-checked, prepared for SoDEX testnet execution, and outcome-tracked after the fact.

## Target users

- Crypto traders who want accountable signals, not black-box alerts.
- Solo analysts building a lightweight on-chain finance desk.
- Builders/judges who need to inspect why an AI agent made a call.

## Core logic

VerdictFi turns SoSoValue-style market intelligence into a complete accountable decision workflow:

1. Capture market/news/flow snapshot with timestamps.
2. Analyst agent generates a thesis, direction, confidence, drivers, horizon, and invalidation rule.
3. Risk agent challenges the thesis against volatility, conflicting data, and sizing constraints.
4. Evidence packet records source data, analyst reasoning, risk objections, required controls, execution status, and outcome status.
5. SoDEX testnet adapter prepares execution records only when the risk gate allows it; automatic submission remains gated until a verified submit adapter is enabled.
6. Outcome tracker scores whether the call was correct, wrong, neutral, or avoided-loss.

## APIs / data sources

- SoSoValue API adapter for market/news/ETF-flow style data.
- SoDEX testnet adapter for execution preparation/gating.
- Deterministic demo fallback when buildathon credentials are not present.

## Why it matters

Most AI trading apps stop at `signal → trade`. VerdictFi adds the missing accountability layer: `thesis → risk challenge → evidence packet → gated execution → measured outcome`.

## Demo notes

The current demo works without secrets. If a SoSoValue key is provided, market data switches to live mode. SoDEX execution remains `prepared`/`blocked` until a verified submit adapter is enabled, so the app never fake-submits.

## Suggested tagline

Every AI market call gets a verdict.
