---
id: 370
title: "Release `printer-serial@0.2.0`: SD file operations, M28 upload and Binary File Transfer"
type: chore
priority: P2
effort: XS
model: sonnet
area: [serial]
story: US62
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [369, 362, 363, 365]
created: 2026-10-25
---

Publish `printer-serial@0.2.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer/serial/` (module: `printer-serial`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.2.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
