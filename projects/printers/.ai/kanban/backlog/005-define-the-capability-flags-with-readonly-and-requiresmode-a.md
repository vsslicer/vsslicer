---
id: 5
title: Define the capability flags with readOnly and requiresMode annotations
type: feature
priority: P0
effort: S
model: opus
area: [api]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP10"
depends_on: [2]
created: 2026-10-25
---

The capability set from `printer-connectivity.md` section 6, with the annotations that express Bambu's Developer Mode gating.

**Code:** `vsslicer/modules/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [ ] Flags `upload, uploadAndStart, start, pause, resume, cancel, listFiles, deleteFile, fileMetadata, thumbnails, telemetryPush, telemetryPoll, rawGcode, webcamSnapshot, webcamStream, queue, history, multiMaterial, filamentSync, discovery, pairing, remoteWorkspaceSafe`, plus `downloadFile` and `moveFile` needed by `printer://` (E24), each addition documented
- [ ] `readOnly` and `requiresMode` annotations: a Bambu-shaped set with Developer Mode off evaluates to read-only with the reason 'requires Developer Mode' (unit test)
- [ ] A helper `can(caps, flag)` is the only place consumers test a capability

## Tasks

- [ ] Write the flag set
- [ ] Write the annotations and helper
- [ ] Unit tests incl. the Bambu-shaped gating

## Progress

Not started.
