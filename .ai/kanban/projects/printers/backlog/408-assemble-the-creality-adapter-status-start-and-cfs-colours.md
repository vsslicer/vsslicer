---
id: 408
title: "Assemble the Creality adapter: status, start and CFS colours"
type: feature
priority: P2
effort: M
model: opus
area: [unofficial]
story: US69
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [405, 406, 407]
created: 2026-10-25
---

Composes the pieces: status, upload then start with `set opGcodeFile "printprt:<path>"`, and for CFS printers the colour mapping from the project's filaments to the boxes and slots, reported through the multi-material capability.

**Code:** `vsslicer/modules/printer-unofficial-creality/src/application/...` (module: `printer-unofficial-creality`, layer: `application`)

## Acceptance criteria

- [ ] Upload then start reaches `printing` on the fixtures; the path in the start command matches the fixture byte for byte
- [ ] A 4-colour mapping to a 4-slot CFS produces the expected `colorMatch` and `multiColorPrint` messages; more colours than slots is refused before sending
- [ ] The adapter is labelled `reverse engineered` in its descriptor

## Tasks

- [ ] Descriptor
- [ ] Start
- [ ] CFS mapping
- [ ] Tests

## Progress

Not started.
