---
id: 116
title: Add import and export bundle commands and open-by-extension handling
type: feature
priority: P1
effort: M
model: sonnet
area: [importers, export]
story: US49
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [144, 59, 142, 141, 143, 137, 138]
created: 2026-10-25
---

Commands to import a bundle (including from the explorer context menu on a bundle file) and export selected entities to a chosen format.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/commands/bundles/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Right-clicking a fixture `.orca_printer` and choosing import adds its entities to the tree (real adapters composed)
- [ ] Exporting two entities to each format writes a file that re-imports to the same entities (integration test)
- [ ] A rejected malicious archive shows a message and writes nothing under the workspace
- [ ] A fixture 3MF with embedded Orca config imports its process and filaments through the composed core and adapters

## Tasks

- [ ] Write the commands
- [ ] Context-menu contribution
- [ ] Integration tests

## Progress

Not started.
