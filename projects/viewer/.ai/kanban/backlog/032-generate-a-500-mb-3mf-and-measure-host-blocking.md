---
id: 32
title: Generate a 500 MB 3MF and measure host blocking
type: chore
priority: P0
effort: M
model: opus
area: [3mf]
story: US8
milestone: "VSS:M2"
depends_on: [31, PLT-13]
created: 2026-10-25
---

A generator (via `tools/generate-large-fixture`, cached by CI) for a 500 MB 3MF, and a test that proves the extension-host thread is never blocked more than 50 ms while it opens.

**Code:** `vsslicer/modules/3mf/test/large/` (module: `3mf`, layer: n/a (ci))

## Acceptance criteria

- [ ] The generated 500 MB fixture opens through the worker
- [ ] Event-loop delay on the host thread stays under 50 ms (measured)
- [ ] Peak memory recorded and a cap is documented

## Tasks

- [ ] Implement the generator
- [ ] Measure delay
- [ ] Record numbers

## Progress

Not started.
