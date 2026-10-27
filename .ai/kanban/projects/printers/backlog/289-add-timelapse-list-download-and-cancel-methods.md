---
id: 289
title: "Add timelapse list, download and cancel methods"
type: feature
priority: P2
effort: M
model: sonnet
area: [camera, daemon]
story: US46
milestone: "VSS:M4"
sprint: "VSS:SP38"
depends_on: [271, 280]
created: 2026-10-25
---

Agent methods `timelapse.list`, `timelapse.download` (streams to the caller with progress) and `timelapse.cancel`, using providers loaded like camera sources.

**Code:** `vsslicer/modules/printer/agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] A fake provider from the camera-api kit lists and downloads through the protocol; progress events arrive in order; cancel stops the transfer and leaves no partial file
- [ ] Credentials stay in the agent; a provider error surfaces as a typed error
- [ ] Version skew: an older agent answers method-not-found

## Tasks

- [ ] Add schemas and handlers
- [ ] Stream download with progress
- [ ] Write protocol tests

## Progress

Not started.
