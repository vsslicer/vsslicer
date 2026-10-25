---
id: 34
title: Set up Playwright snapshots on Chromium with SwiftShader
type: chore
priority: P0
effort: M
model: sonnet
area: [renderer]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [32]
created: 2026-10-25
---

Pixel oracle for the renderer. Needs PLT test tooling; confirm `--enable-unsafe-swiftshader` on free GitHub runners early.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] Snapshots exist for each colour mode, a layer range and a travel toggle on corpus files
- [ ] A shader change that moves pixels beyond tolerance fails the run
- [ ] Runs in CI on a free runner

## Tasks

- [ ] Harness page
- [ ] Snapshot set
- [ ] CI job

## Progress

Not started.
