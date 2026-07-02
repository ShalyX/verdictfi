# VerdictFi

**A one-person finance desk where every AI market call is explainable, risk-checked, executable on SoDEX testnet, and outcome-tracked after the fact.**

Built for the SoSoValue AKINDO WaveHack.

## Core flow

1. **SoSoValue data in** — market price, ETF/news flow, sentiment, volatility, SSI-style momentum.
2. **AI analyst generates thesis** — direction, confidence, drivers, horizon, invalidation rule.
3. **Risk agent challenges it** — approves, cautions, or rejects based on volatility/conflicts/sizing.
4. **Evidence packet records everything** — sources, timestamps, thesis, objections, controls, execution status.
5. **SoDEX testnet adapter** — approved/cautioned cases are prepared by default and can be submitted to a configured SoDEX testnet endpoint when `SODEX_TESTNET_SUBMIT_ENABLED=true`.
6. **Outcome tracker** — checks whether the signal was correct, wrong, neutral, or avoided loss.

## Why it is different

Most submissions follow: `AI signal → trade`.

VerdictFi follows: `AI thesis → risk challenge → evidence packet → gated SoDEX testnet execution → outcome accountability`.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

- `/api/health` — production readiness health check without leaking secrets.
- `/api/run` — create + persist a new packet. Input is validated and rate-limited.
- `/api/outcomes` — aggregate persisted packet outcomes.
- `/api/packets/:id` — fetch one persisted packet as JSON.
- `/packets/:id` — public judge-readable evidence packet page.

## Verification commands

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
npm run dev
VERDICTFI_URL=http://localhost:3000 npm run smoke:prod
VERDICTFI_URL=http://localhost:3000 npm run demo:full
```

## Environment

Demo mode works with no secrets.

Optional live integrations:

- `SOSOVALUE_API_KEY` — enables the live adapter. The app calls documented SoSoValue endpoints using the `x-soso-api-key` header: `/currencies`, `/currencies/{currency_id}/market-snapshot`, `/etfs/summary-history?country_code=US`, and `/news`. If any live call fails, the packet is clearly marked `demo` with the adapter error.
- `SOSOVALUE_API_BASE` — optional override; defaults to `https://openapi.sosovalue.com/openapi/v1`.
- `SOSOVALUE_API_TIMEOUT_MS` and `SOSOVALUE_API_RETRIES` — live adapter network controls.
- `VERDICTFI_RATE_LIMIT_MAX` and `VERDICTFI_RATE_LIMIT_WINDOW_MS` — `/api/run` abuse controls.
- `VERDICTFI_DB_PATH` — SQLite packet store path; use persistent disk in production deployments.
- `SODEX_TESTNET_API_KEY` and `SODEX_TESTNET_PRIVATE_KEY` — credentials used by the SoDEX testnet submit adapter.
- `SODEX_TESTNET_SUBMIT_ENABLED` — set to `true` to open testnet submission for risk-approved / caution cases.
- `SODEX_TESTNET_SUBMIT_URL` — SoDEX testnet order endpoint. If missing or failing, VerdictFi keeps the order `prepared` for retry rather than claiming submission.
- `OPENAI_API_KEY` — replace deterministic analyst with model-backed thesis generation.

## Production-readiness controls

- Health endpoint: `/api/health` checks database + integration configuration and never returns secret values.
- API boundary: `/api/run` validates asset, risk mode, and notional cap before generating packets.
- Abuse control: in-memory per-instance rate limit for packet generation. Forwarded IP headers are ignored unless `VERDICTFI_TRUST_PROXY_HEADERS=true` is explicitly set behind a trusted proxy. Use Redis/Upstash or platform rate limits for multi-instance deployments.
- Live adapter resilience: SoSoValue calls use timeout + retry and fall back to explicitly marked demo packets on failure.
- Security headers: frame denial, content-type protection, referrer policy, permissions policy, and CSP are configured in `next.config.ts`.
- CI: `.github/workflows/ci.yml` runs install, Playwright browser install, lint, unit/API tests, build, and E2E.
- Container: `Dockerfile` builds the Next standalone server and runs as a non-root user.

## Submission positioning

VerdictFi is an accountable AI finance desk powered by SoSoValue and SoDEX. It turns market intelligence into trade theses, forces each thesis through a risk challenge, records a transparent evidence packet, prepares or submits approved calls on SoDEX testnet depending on configuration, and tracks whether the agent was right after the fact.

For precise production language: VerdictFi is production-ready as a live-data, audited-packet web app; real-capital trading remains intentionally gated until live SoDEX credentials, legal/compliance review, and final key-management controls are enabled.
