---
id: 45
title: "Define the command catalogue schema, loader and lint"
type: feature
priority: P0
effort: M
model: sonnet
area: [language]
story: US16
milestone: "VSS:M1"
depends_on: [44]
created: 2026-10-25
---

Catalogue as a data module in `@vsslicer/gcode` for hovers and later E50. Descriptions are written by us; each entry links reprap.org/wiki/G-code, the Prusa Buddy page or the Klipper G-code reference.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] Schema with code, parameters, flavours, description, source link
- [ ] Lint fails CI for an entry without a source link or flavour list (test with a bad entry)

## Tasks

- [ ] Schema
- [ ] Loader
- [ ] Lint script and CI step

## Progress

Not started.
