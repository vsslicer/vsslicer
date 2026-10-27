---
id: 159
title: Fetch the bundled VSIX files and verify their sha256
type: feature
priority: P2
effort: M
model: sonnet
area: [fork]
story: US67
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [158, 144, 102, GCP-75, VWR-388, PRF-176, PRN-378, PRN-60, PRN-315, SLC-276, FIL-96]
created: 2026-10-25
---

Downloads each bundled extension's VSIX from its GitHub release (or the local registry in tests), checks the pinned `sha256`, and puts them where the build expects them. Depends on the final or release card of each bundled extension module and on `themes@0.1.0`.

**Code:** `vsslicer/modules/tooling/vsslicer-build/src/adapters/fetch-builtins.ts` (module: `vsslicer-build`, layer: `adapters`)

## Acceptance criteria

- [ ] The G-code (GCP-75 and PLT-102), project (VWR-388), profiles (PRF-176), printers (PRN-378), Bambu (PRN-60), camera (PRN-315), slicer (SLC-276), filament (FIL-96) and themes extensions are fetched
- [ ] A hash mismatch fails naming the extension and both hashes; a missing release fails naming the version
- [ ] A test uses a local registry fixture, no network

## Tasks

- [ ] Write the fetcher and verifier
- [ ] Write the tests against a local fixture registry

## Progress

Not started.
