---
id: 307
title: Verify WebRTC in desktop VS Code and on the H2C sidecar stream
type: chore
priority: P2
effort: S
model: opus
area: [camera, bambu]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [306, 271]
created: 2026-10-25
---

Check WebRTC in a desktop webview on one platform, the H2C stream through the sidecar's WebRTC, and record remote hosts as unverified if it fails there.

**Code:** `vsslicer/modules/apps/camera/` (module: `camera-extension`, layer: `n/a (hardware verification)`)

## Acceptance criteria

- [ ] Result in `docs/` with VS Code version, OS, network and date for local WebRTC and for the H2C via the sidecar
- [ ] Remote hosts recorded as verified or 'unverified, fails with <reason>'

## Tasks

- [ ] Run local and H2C
- [ ] Try a remote host
- [ ] Write the results

## Progress

Not started.
