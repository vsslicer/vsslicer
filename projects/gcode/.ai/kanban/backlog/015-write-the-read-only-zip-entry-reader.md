---
id: 15
title: Write the read-only zip entry reader
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US5
milestone: "VSS:M1"
depends_on: [5]
created: 2026-10-25
---

Central directory and raw inflate for `.gcode.3mf`. Written new. Prefer the VWR container layer if it has shipped (the coordinator's reconciliation); fall back to fflate directly and note the later migration.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] Reads central directory, stored and deflated entries, data descriptors and zip64 on test archives
- [ ] A truncated or malformed zip gives a typed diagnostic (test)

## Tasks

- [ ] Check whether the VWR container layer exists
- [ ] Implement or wrap
- [ ] Tests with descriptors and zip64

## Progress

Not started.
