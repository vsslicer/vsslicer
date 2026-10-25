---
id: 278
title: "Define timelapse entries, providers and download types"
type: feature
priority: P2
effort: S
model: sonnet
area: [camera, api]
story: US46
milestone: "VSS:M4"
depends_on: [246]
created: 2026-10-25
---

`CameraSource.timelapses()` types: `TimelapseEntry` (name, size, date, container, optional thumbnail, render state), `TimelapseProvider` (list, request render, download with progress and `AbortSignal`) and the per-model capability record.

**Code:** `vsslicer/modules/camera-api/src/domain/...` (module: `camera-api`, layer: `domain`)

## Acceptance criteria

- [ ] Type tests: a provider implementing list and download only compiles; render is optional
- [ ] Download progress and cancel are part of the type (type test)
- [ ] Exports are added without breaking `0.1.0` consumers (api-extractor report diff is additive)

## Tasks

- [ ] Write the types
- [ ] Write the type tests

## Progress

Not started.
