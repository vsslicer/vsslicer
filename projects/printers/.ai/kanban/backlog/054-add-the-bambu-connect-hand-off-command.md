---
id: 54
title: Add the Bambu Connect hand-off command
type: feature
priority: P2
effort: S
model: sonnet
area: [bambu]
story: US13
milestone: "VSS:M3"
depends_on: [50]
created: 2026-10-25
---

Open a file in Bambu Connect through `bambu-connect://import-file`.

**Code:** `vsslicer/modules/bambu-extension/src/presentation/...` (module: `bambu-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] URL builder unit test; macOS or Windows opens Bambu Connect (manual checklist, owner); Linux shows an explanation
- [ ] No signing code or certificate is involved

## Tasks

- [ ] URL builder
- [ ] Command
- [ ] Checklist

## Progress

Not started.
