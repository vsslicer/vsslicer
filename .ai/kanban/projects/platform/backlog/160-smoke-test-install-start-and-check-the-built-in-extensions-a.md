---
id: 160
title: "Smoke test: install, start and check the built-in extensions are active"
type: chore
priority: P2
effort: M
model: sonnet
area: [ci]
story: US67
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [149, 159, 152]
created: 2026-10-25
---

Installs the Linux build, starts it headless and asks the extension host which extensions are active.

**Code:** `vsslicer/modules/tooling/vsslicer-build/test/smoke/` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] The test starts the build under a virtual display, lists active extensions via the test harness and fails naming any bundled extension that is not active
- [ ] The editor quits cleanly (exit code 0 within 10 s)
- [ ] Runs on linux-x64 in CI; other targets when their builds exist

## Tasks

- [ ] Write the harness
- [ ] Write the activation assertions

## Progress

Not started.
