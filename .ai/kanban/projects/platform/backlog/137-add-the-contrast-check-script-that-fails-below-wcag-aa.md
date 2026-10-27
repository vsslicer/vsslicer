---
id: 137
title: Add the contrast check script that fails below WCAG AA
type: feature
priority: P3
effort: S
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M8"
sprint: "VSS:SP52"
depends_on: [134, 135, 136]
created: 2026-10-25
---

Reads each generated theme and checks editor foreground/background and the main token colours at AA (4.5:1; 3:1 for large UI pairs as listed).

**Code:** `vsslicer/modules/apps/themes/src/adapters/contrast-check.ts` (module: `themes`, layer: `adapters`)

## Acceptance criteria

- [ ] The script lists each pair checked and its ratio, and exits non-zero naming theme, pair and ratio when below AA
- [ ] A deliberately bad fixture theme makes the script fail (meta-test)
- [ ] The script runs in the module CI job

## Tasks

- [ ] Write the CLI over `contrast.ts`
- [ ] Define the checked pairs as data
- [ ] Add the meta-test

## Progress

Not started.
