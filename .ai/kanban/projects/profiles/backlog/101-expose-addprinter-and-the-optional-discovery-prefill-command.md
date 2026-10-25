---
id: 101
title: Expose addPrinter() and the optional discovery prefill command
type: feature
priority: P1
effort: S
model: sonnet
area: [wizard]
story: US42
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [99]
created: 2026-10-25
---

`vsslicer.profiles.addPrinter()` for SLC and PRN, plus an optional command that prefills the connection step when a printer extension provides discovery results.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/api/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A stub extension calls `addPrinter()` and gets the created instance id or a cancel result
- [ ] With no discovery provider installed the connection step is simply empty (test)

## Tasks

- [ ] Export the API
- [ ] Prefill command contract
- [ ] Stub-extension test

## Progress

Not started.
