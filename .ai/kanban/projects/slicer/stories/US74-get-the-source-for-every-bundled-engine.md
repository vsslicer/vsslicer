---
id: US74
title: "Get the source for every bundled engine"
status: reviewed
epic: VSS:E66
---

As a user and a licensee under AGPL, I want the source revision and build recipe published for each shipped engine file, so that I can rebuild it.

## Acceptance criteria

- [ ] The engine is built reproducibly in CI from a pinned revision; each release publishes the corresponding source (D2 obligation 4)
- [ ] Every distributed binary or WASM file has its source revision and build recipe in a provenance file, and CI checks the file exists
- [ ] VSIX size stays within the budget, and the packaging decision (in `vsslicer.slicer` or a separate extension) is recorded

## Out of scope

