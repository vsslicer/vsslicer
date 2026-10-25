---
id: US65
title: "Find or install PrusaSlicer"
status: reviewed
epic: VSS:E65
---

As a Prusa printer owner, I want VSSlicer to detect PrusaSlicer or download the pinned release after I confirm, so that I can slice with it.

## Acceptance criteria

- [ ] An installed PrusaSlicer 2.9.x is detected and its version probed; the pinned release downloads with SHA-256 verification into global storage after a confirmation
- [ ] Engine choice includes `prusa` and a path setting; an unknown or too old version gives a typed error
- [ ] Prusa profile repositories are fetched from upstream, not bundled (D4)

## Out of scope

- Prusa Connect and PrusaLink upload (PRN)
- SLA (E67)
