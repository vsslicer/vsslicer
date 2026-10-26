---
id: 57
title: Parse the Cura formula subset to an AST
type: feature
priority: P1
effort: M
model: opus
area: [cura]
story: US13
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [56]
created: 2026-10-25
---

Tokenizer and parser for the Python-expression subset. Semantics follow Uranium's `SettingFunction` (LGPL-3.0, porting allowed under D2): ported pieces carry the notice and `Ported from Uranium@<commit>:UM/Settings/SettingFunction.py`.

**Code:** `vsslicer/modules/cura-settings/src/domain/...` (module: `cura-settings`, layer: `domain`)

## Acceptance criteria

- [ ] Every supported formula in the pinned definitions parses; unsupported syntax gives an error naming the setting key and the form
- [ ] Round trip: printing the AST and reparsing is the same AST (property test)
- [ ] Provenance lines present on ported pieces (licence check passes)

## Tasks

- [ ] Tokenizer
- [ ] Parser
- [ ] Property tests

## Progress

Not started.
