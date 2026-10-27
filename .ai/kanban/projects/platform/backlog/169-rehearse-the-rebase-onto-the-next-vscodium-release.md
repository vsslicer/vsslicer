---
id: 169
title: Write the rebase routine and rehearse it on the next VSCodium release
type: spike
priority: P0
effort: M
model: opus
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP17"
depends_on: [167]
created: 2026-10-25
---

How we move the pin to a new VSCodium release. VSCodium refreshes its own patches by hand with `dev/update_patches.sh`, which writes `.rej` files and waits for a person (`vscodium@be70704:dev/update_patches.sh:102-130`); our three patches and one new file are small (`docs/research/vscodium-build.md` §2, §4).

**Code:** `scripts/rebase.mjs`, `docs/rebase.md` (repo: `vsslicer/vsslicer-build`, layer: `adapters` (script) and docs)

## Acceptance criteria

- [ ] `pnpm rebase <vscodium-tag>` updates the pin, runs `check-patches`, and for each failing patch writes the rejects and the upstream diff of the touched file
- [ ] `docs/rebase.md` is the routine: when (each VSCodium stable release, or monthly), steps, who reviews, how a release rolls back
- [ ] One rehearsal on the next VSCodium release after the first build, recorded with time spent and the patches that broke

## Tasks

- [ ] Script
- [ ] Routine doc
- [ ] Rehearsal

## Progress

Not started.
