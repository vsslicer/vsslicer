---
id: 70
title: "Release `gcode-templates@0.1.0`: placeholder catalogues, tokenizer, completion, hover and validation"
type: chore
priority: P2
effort: XS
model: sonnet
area: [language]
story: US46
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [68, 69, 61, 62]
created: 2026-10-25
---

Publish `gcode-templates@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/gcode-templates/` (module: `gcode-templates`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
