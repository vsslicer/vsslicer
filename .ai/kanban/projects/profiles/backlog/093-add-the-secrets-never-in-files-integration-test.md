---
id: 93
title: Add the secrets-never-in-files integration test
type: feature
priority: P0
effort: M
model: opus
area: [store]
story: US37
milestone: "VSS:M2"
sprint: "VSS:SP18"
depends_on: [88, 144, 86, 137, 138, 139, 141, 142, 143]
created: 2026-10-25
---

The regression guard for the most serious failure: a credential in a git-tracked workspace. Runs with the real adapters composed.

**Code:** `vsslicer/modules/profiles-extension/test/secrets/` (module: `profiles-extension`, layer: `presentation`, integration test)

## Acceptance criteria

- [ ] Import fixture physical printers (Prusa, Orca, Cura adapters) with known credential strings and create one by hand, then scan the workspace, `globalStorageUri` and every exported file and bundle of every format for those strings: zero hits
- [ ] A deliberately leaking build (a test-only flag that writes the credential) makes the test fail
- [ ] Runs in the PLT-16 integration matrix

## Tasks

- [ ] Write the scanner
- [ ] Write the leak-injection check
- [ ] Wire into the matrix

## Progress

Not started.
