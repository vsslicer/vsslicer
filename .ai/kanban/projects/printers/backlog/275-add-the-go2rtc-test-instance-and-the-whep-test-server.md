---
id: 275
title: Add the go2rtc test instance and the WHEP test server
type: chore
priority: P2
effort: M
model: sonnet
area: [camera]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [272, 246]
created: 2026-10-25
---

CI helpers: a go2rtc process with a test source (pinned version, checksum verified) and a small WHEP server that answers an offer with a canned answer.

**Code:** `vsslicer/modules/camera-webrtc/` (module: `camera-webrtc`, layer: `n/a (test kit)`)

## Acceptance criteria

- [ ] The go2rtc helper starts on 127.0.0.1, serves a test stream and stops cleanly; skipped with a clear message when the binary is not cached
- [ ] The WHEP server answers 201 with an SDP answer and a Location header, and 4xx on a bad offer

## Tasks

- [ ] Write the go2rtc helper
- [ ] Write the WHEP server
- [ ] Write self-tests

## Progress

Not started.
