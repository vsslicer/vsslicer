---
id: US4
title: "An extension author reads and books spools through the Inventory API"
status: reviewed
epic: VSS:E40
---

As an author of another VSSlicer module or extension, I want a published `Inventory` API (spools, get, onDidChange, book, measure, matchByTag, create, update, archive), so that I can use spools without reading the store files.

## Acceptance criteria

- [ ] `@vsslicer/filament@0.1.0` is published to the local registry and a clean consumer install passes
- [ ] The API has no `vscode` import (lint rule) and `package.json` licence is `AGPL-3.0-or-later`
- [ ] `onDidChange` fires once per committed change, including a change made by another process
- [ ] Typed errors for missing density, lock timeout and corrupt line reach the caller

## Out of scope

- UI
