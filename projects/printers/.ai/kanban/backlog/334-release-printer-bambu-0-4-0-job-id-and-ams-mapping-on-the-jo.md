---
id: 334
title: "Release `printer-bambu@0.4.0`: job id and AMS mapping on the job, tray metadata, ipcam and out-of-root FTPS"
type: chore
priority: P1
effort: XS
model: sonnet
area: [bambu]
story: "FIL:US15"
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [330, 331, 332, 333]
created: 2026-10-25
---

Publish `printer-bambu@0.4.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-bambu/` (module: `printer-bambu`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.4.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
