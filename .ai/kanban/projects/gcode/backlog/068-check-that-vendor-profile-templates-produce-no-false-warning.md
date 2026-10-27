---
id: 68
title: Check that vendor profile templates produce no false warnings
type: chore
priority: P2
effort: M
model: sonnet
area: [language]
story: US44
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [67, 64, PRF-23]
created: 2026-10-25
---

Oracle test: extract every G-code template string from the pinned Orca/Bambu and PrusaSlicer vendor packs that the profiles CI cache downloads, run `validateTemplate` with the right kind, and require no placeholder warnings.

**Code:** `vsslicer/modules/core/gcode-templates/test/vendor-packs/` (module: `gcode-templates`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] Every start, end, layer-change, tool-change, pause and filament G-code string in the pinned packs is checked in its own kind; zero placeholder warnings (an allowlist entry needs a written reason)
- [ ] The test skips offline with a stated reason and runs in CI where a missing pack fails the job
- [ ] The count of strings checked is asserted so the test cannot pass by checking nothing

## Tasks

- [ ] Extract strings from the packs
- [ ] Run validation
- [ ] Allowlist file

## Progress

Not started.
