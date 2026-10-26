---
id: 111
title: Move the .gcode.3mf readers to a parser subpath so the preview can take gcode-parser 0.12
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP7"
created: 2026-10-26
---

Found at SP6's release: gcode-parser 0.12.0 (GCP-15, GCP-16) imports @vsslicer/3mf from its main entry, so gcode-preview's worker bundle would inline 3mf's `saxes@6.0.0`, which ships no LICENSE file; tooling's `third-party-notices` refuses it (ISC requires the licence text). gcode-preview 0.4.0 therefore stays on gcode-parser ^0.11.0 and does not get GCP-99's one flavour table yet (a Cura `;FLAVOR:RepRap` file is still parsed as Marlin in the preview while the planner times it as RepRapFirmware).

**Code:** `vsslicer/modules/gcode-parser` (package.json exports, src/index.ts), then `vsslicer/modules/gcode-preview` (module: gcode-parser, layer: adapters)

## Acceptance criteria

- [ ] The `.gcode.3mf` readers move to a subpath entry (e.g. `@vsslicer/gcode-parser/gcode-3mf`), so the main entry no longer imports @vsslicer/3mf (test like gcode-preview's bundle test)
- [ ] gcode-preview takes gcode-parser and gcode-api at their current ranges, builds (notices check passes) and its tests pass
- [ ] Whoever bundles the 3mf entry later supplies saxes's ISC text (a tooling or 3mf change, decided then)

## Tasks

- [ ] Subpath entry
- [ ] Release gcode-parser, re-lock gcode-preview

## Progress

Not started.
