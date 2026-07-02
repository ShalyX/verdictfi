# VerdictFi Demo Video Script

## 0:00 — Problem

Most AI trading dashboards give a signal and ask users to trust it. VerdictFi treats every signal as a decision that must be explained, challenged, recorded, and measured.

## 0:15 — Product

VerdictFi is a one-person finance desk powered by SoSoValue market intelligence and a SoDEX testnet execution adapter.

## 0:25 — Run the desk

Pick an asset and notional size. Click **Generate accountable signal**.

## 0:35 — Analyst thesis

The analyst agent reads the market snapshot and produces a directional thesis with confidence, drivers, horizon, and invalidation rule.

## 0:55 — Risk challenge

The risk agent reviews volatility, conflicting data, and sizing. It can approve, caution, or reject before execution opens.

## 1:15 — Evidence packet

VerdictFi records the source fields, timestamps, thesis, risk objections, controls, SoDEX adapter status, and outcome status in a downloadable JSON evidence packet.

## 1:35 — SoDEX and outcome

If the risk gate approves, the SoDEX testnet adapter submits when the testnet endpoint is configured; otherwise it keeps a prepared record for retry. Later, the outcome tracker scores whether the call was correct, wrong, neutral, or avoided a loss.

## 1:55 — Close

VerdictFi is not another black-box AI signal bot. It is an accountable finance desk: thesis, challenge, evidence, execution gate, and outcome tracking.
