---
id: 377
title: Read longFilenames as the sanitiser default in Export to drive or folder
type: feature
priority: P2
effort: S
model: sonnet
area: [storage]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [343, 339, 136]
created: 2026-10-25
---

Export to drive or folder passes the selected printer's `longFilenames` capability to the sanitiser as the default; the connection setting still overrides it.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With the fake adapter reporting `longFilenames` the exported file keeps its long name; without it the 8.3 name is used (integration test)
- [ ] The connection setting `longFilenames` true or false overrides the capability
- [ ] A printer that is offline falls back to 8.3 and the notice says why

## Tasks

- [ ] Read capability
- [ ] Pass to the sanitiser
- [ ] Tests

## Progress

Not started.
