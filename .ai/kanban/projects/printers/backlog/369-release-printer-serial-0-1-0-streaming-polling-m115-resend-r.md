---
id: 369
title: "Release `printer-serial@0.1.0`: streaming, polling, M115, resend recovery and port listing"
type: chore
priority: P2
effort: XS
model: sonnet
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [368, 366, 357, 361]
created: 2026-10-25
---

Publish `printer-serial@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer/serial/` (module: `printer-serial`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
