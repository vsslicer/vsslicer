---
id: 13
title: Assemble the public Inventory API
type: feature
priority: P1
effort: M
model: sonnet
area: [model]
story: US4
milestone: "VSS:M4"
sprint: "VSS:SP17"
depends_on: [6, 10, 11]
created: 2026-10-25
---

`Inventory`: spools(), get(id), onDidChange, book, measure, matchByTag, create/update/archive, built over the store ports with a tiny typed emitter (no `vscode`).

**Code:** `vsslicer/modules/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] `onDidChange` fires once per committed change and once for a change made by another process (child-process test)
- [ ] Typed errors for missing density, lock timeout and corrupt line are exported
- [ ] No `vscode` import (lint rule); `package.json` licence is `AGPL-3.0-or-later`; the public surface is checked by an API report

## Tasks

- [ ] Assemble the facade
- [ ] Emitter
- [ ] API report and tests

## Progress

Not started.
