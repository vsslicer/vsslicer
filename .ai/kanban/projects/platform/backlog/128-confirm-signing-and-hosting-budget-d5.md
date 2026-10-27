---
id: 128
title: Confirm signing and hosting budget (D5)
type: spike
priority: P1
effort: S
model: opus
area: [fork]
story: US68
milestone: "VSS:M7"
depends_on: [127]
created: 2026-10-25
---

The single decision card for the paid items of I11: D5 says no budget for signing, notarisation, a hosted registry or paid CI. This card puts the question to the owner with costs and options and records the answer; every signing and hosting card depends on it.

**Code:** `docs/budget-decision.md` (repo: `vsslicer/vsslicer-build`, layer: n/a (decision))

## Acceptance criteria

- [ ] `docs/budget-decision.md` lists the costs and the choices: Apple Developer ID and notarisation, Windows signing through SignPath OSS or a certificate, a registry host (with a monthly estimate and the cheapest viable option), and what stays free (GitHub Actions public minutes)
- [ ] The owner answer is recorded per item (macOS signing, Windows signing, hosted registry) as yes, no or later, with date; the board question is resolved
- [ ] Default if unanswered: no to all three; the dependent cards stay in backlog and their fallbacks apply
- [ ] A decision document (D-number) is proposed on the platform decisions list for the owner to accept

## Tasks

- [ ] Gather current prices and the SignPath OSS conditions
- [ ] Ask the owner on the board (`board.py ask`)
- [ ] Record the answer

## Progress

Not started.
