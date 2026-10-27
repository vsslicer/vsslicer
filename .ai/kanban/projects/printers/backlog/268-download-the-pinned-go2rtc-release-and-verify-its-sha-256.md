---
id: 268
title: Download the pinned go2rtc release and verify its SHA-256
type: feature
priority: P1
effort: M
model: opus
area: [camera, daemon]
story: US44
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [253, SLC-14, 261]
created: 2026-10-25
---

Download go2rtc (MIT) on request from its GitHub release with the pinned version and SHA-256 per platform, using the verified download of `slicer-runtime`; security-sensitive.

**Code:** `vsslicer/modules/printer/agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

## Acceptance criteria

- [ ] Pin table (version, asset, SHA-256) for macOS, Linux and Windows from the spike findings; a download from a local server with the right checksum installs and is marked executable
- [ ] A wrong checksum refuses to run and deletes the file (test with a tampered archive)
- [ ] Nothing downloads without an explicit call from the extension (consent comes from the UI card)

## Tasks

- [ ] Write the pin table
- [ ] Call the verified download
- [ ] Write the tamper test

## Progress

Not started.
