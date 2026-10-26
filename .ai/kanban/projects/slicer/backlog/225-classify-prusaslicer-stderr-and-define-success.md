---
id: 225
title: Classify PrusaSlicer stderr and define success
type: feature
priority: P2
effort: M
model: opus
area: [prusa]
story: US66
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [7, 217, 218]
created: 2026-10-25
---

The engine's only reliable signal is its output: success needs an existing, non-empty, parseable file and no error line on stderr. This card holds the stderr classifier and the typed errors; the I/O is in P12.

**Code:** `vsslicer/modules/slicer-prusa/src/domain/...` (module: `slicer-prusa`, layer: `domain`)

## Acceptance criteria

- [ ] Recorded stderr from the report maps to the right typed error: missing model, invalid config, collision, generic error line
- [ ] A warning-only stderr is a success with the warnings attached
- [ ] A stderr with an error line and an output file is a failure (regression: a failed slice reported as success)

## Tasks

- [ ] Error line patterns
- [ ] Typed errors and messages
- [ ] Recorded-stderr tests

## Progress

Not started.
