---
id: 49
title: Run mesh parsing in a Web Worker pool for the webview
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US15
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [47, 46, PLT-36, PLT-37]
created: 2026-10-25
---

Web Worker pool that uses the E2 transport to receive bytes and return transferred buffers, under the kit CSP.

**Code:** `vsslicer/modules/mesh/src/adapters/worker-web/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] A pool of N workers parses fixtures in headless Chromium through the kit's transport
- [ ] Results are transferred, not copied
- [ ] Worker creation works under the kit CSP (E2's answer)

## Tasks

- [ ] Pool
- [ ] Transport wiring
- [ ] Browser test

## Progress

Not started.
