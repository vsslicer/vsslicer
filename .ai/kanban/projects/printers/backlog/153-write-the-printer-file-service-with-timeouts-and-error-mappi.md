---
id: 153
title: Write the printer file service with timeouts and error mapping
type: feature
priority: P1
effort: M
model: opus
area: [storage]
story: US28
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [17, 84]
created: 2026-10-25
---

Vscode-free service mapping `Session.files` to stat, readDirectory, read, write, delete, rename with read-only detection and per-call timeouts.

**Code:** `vsslicer/modules/apps/printers/src/application/...` (module: `printers-extension`, layer: `application`)

## Acceptance criteria

- [ ] Against the fake adapter: each operation; an adapter lacking write capabilities is read-only; unreachable printer gives an 'unavailable' result within the timeout; no call hangs the caller
- [ ] Read size limit and 'needs prompt' signal for big downloads (US29)

## Tasks

- [ ] Service
- [ ] Timeouts and mapping
- [ ] Unit tests

## Progress

Not started.
