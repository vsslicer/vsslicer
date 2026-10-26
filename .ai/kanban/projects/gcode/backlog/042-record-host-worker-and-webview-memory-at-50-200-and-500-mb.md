---
id: 42
title: "Record host, worker and webview memory at 50, 200 and 500 MB"
type: chore
priority: P0
effort: L
model: sonnet
area: [editor]
story: US14
milestone: "VSS:M1"
sprint: "VSS:SP10"
depends_on: [41, 38]
created: 2026-10-25
---

Budget gate for the whole pipeline, with SwiftShader or a GPU.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] Peak host, worker and webview memory recorded at the three sizes; total under about 1 GB at 500 MB
- [ ] A budget regression fails CI

## Tasks

- [ ] Measurement harness
- [ ] Budget file
- [ ] CI job

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: dependency-blocked in SP5 (rule 7): depends on GCP-41 (moved to SP6).
