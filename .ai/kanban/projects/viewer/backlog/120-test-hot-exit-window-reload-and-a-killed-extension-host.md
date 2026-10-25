---
id: 120
title: "Test hot exit: window reload and a killed extension host"
type: feature
priority: P1
effort: M
model: opus
area: [editor]
story: US37
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [119, PLT-15, PLT-16]
created: 2026-10-25
---

Edit a fixture, reload the window, check the edits are back and the document is dirty; kill the extension host process and check the same.

**Code:** `vsslicer/modules/project-extension/test/integration/hotexit/` (module: `project-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Both cases restore the edits and the dirty state on Linux, macOS and Windows
- [ ] VSCodium is included in the matrix run
- [ ] Failure shows the replayed command count

## Tasks

- [ ] Window reload test
- [ ] Kill test
- [ ] Matrix run

## Progress

Not started.
