---
id: 21
title: "Spike: can the upstream CLIs print a resolved config to use as an oracle"
type: spike
priority: P0
effort: S
model: opus
area: [importers]
story: US19
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [1]
created: 2026-10-25
---

Answers whether PrusaSlicer `--export-config`/`--save` and Orca `--export-settings` print a resolved config, so the tuple cards of each adapter module have an oracle. Shared research notes, not part of any module.

**Code:** `vsslicer/fixtures/profile-research/oracle.md` (layer: n/a (spike notes))

## Acceptance criteria

- [ ] A written result per CLI: command run, version, whether the output is fully resolved, how to read it; or a statement that none exists
- [ ] Decides which oracle each ecosystem's tuple test uses (CLI export, or hand-checked expectations citing `profiles.md` lines)
- [ ] Runs the CLIs only on fixture inputs, from a scratch dir, never inside a clone

## Tasks

- [ ] Run each CLI on a vendor preset
- [ ] Compare with a hand merge
- [ ] Write the decision

## Progress

Not started.
