---
id: 85
title: Check desktop-only commands are hidden on the web
type: feature
priority: P2
effort: S
model: sonnet
area: [web]
story: US55
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [80]
created: 2026-10-25
---

A manifest check: commands listed in an extension's `desktopOnlyCommands` (a documented field) must have `!isWeb` in their command palette and menu `when` clauses; extensions call it from their own tests.

**Code:** `vsslicer/modules/tooling/src/manifest/...` (module: `tooling`, layer: `adapters`)

## Acceptance criteria

- [ ] A fixture manifest with a desktop-only command lacking `!isWeb` fails the check naming the command and menu; the corrected manifest passes
- [ ] The field and the check are documented in the tooling README

## Tasks

- [ ] Check
- [ ] Fixtures
- [ ] Docs

## Progress

Not started.
