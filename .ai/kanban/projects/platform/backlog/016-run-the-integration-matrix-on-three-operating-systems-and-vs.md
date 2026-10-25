---
id: 16
title: Run the integration matrix on three operating systems and VSCodium
type: feature
priority: P0
effort: M
model: sonnet
area: [ci]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [15]
created: 2026-10-25
---

CI job: minimum and stable VS Code on ubuntu (xvfb), macos and windows, and the latest VSCodium release on Linux (D1).

## Acceptance criteria

- [ ] The sample extension activates in all seven cells (min and stable on three OSes, VSCodium on Linux)
- [ ] VSCodium download resolves the latest release and prints its version
- [ ] Cells run in parallel and each uploads its logs

## Tasks

- [ ] Add the job matrix
- [ ] Add VSCodium download and launch via the runner
- [ ] Print versions into the job summary

## Progress

Not started.
