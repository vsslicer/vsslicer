---
id: 154
title: "Add the printer:// FileSystemProvider"
type: feature
priority: P1
effort: M
model: opus
area: [storage]
story: US28
milestone: "VSS:M3"
depends_on: [153]
created: 2026-10-25
---

`printer://<name>/` mounted in the Explorer over the file service.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `readDirectory`, `stat`, `readFile`, `writeFile`, `delete` and `rename` work with the fake adapter; permission errors are `FileSystemError.NoPermissions`, unreachable is `Unavailable`; file-change events fire after upload and delete

## Tasks

- [ ] Provider
- [ ] Error mapping
- [ ] Events and tests

## Progress

Not started.
