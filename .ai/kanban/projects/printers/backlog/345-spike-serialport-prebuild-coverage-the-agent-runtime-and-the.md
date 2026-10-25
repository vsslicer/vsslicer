---
id: 345
title: "Spike: serialport prebuild coverage, the agent runtime and the CI matrix"
type: spike
priority: P2
effort: M
model: opus
area: [serial]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [344]
created: 2026-10-25
---

Settles which targets can ship a native `serialport` and how the agent loads it, before platform VSIXs are built. Result is a table plus a decision in the module docs.

**Code:** `vsslicer/modules/printer-serial/docs/serialport-targets.md` (module: `printer-serial`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] A matrix lists the `serialport` version, each OS/architecture its prebuilds cover (N-API), and the Node and Electron ABIs of the current VS Code stable and insiders; the uncovered targets (armhf is the known thin one) are named
- [ ] A script loads `serialport` inside the agent entry point's runtime on each CI OS and reports the result; whether the agent runs under system Node or the Electron-as-Node runtime is stated with the evidence
- [ ] The decision records: which targets get a VSIX, which get a message, and whether prebuilds are bundled or fetched
- [ ] Findings are in `vsslicer/modules/printer-serial/docs/serialport-targets.md` with dates and versions

## Tasks

- [ ] Read the serialport prebuild list and the agent launch code
- [ ] Run the load test on three operating systems
- [ ] Write the decision

## Progress

Not started.
