---
id: 166
title: Include THIRD-PARTY-NOTICES and the source offer in every installer
type: feature
priority: P0
effort: S
model: sonnet
area: [fork]
story: US67
milestone: "VSS:M6"
sprint: "VSS:SP16"
depends_on: [149, 12]
created: 2026-10-25
---

Generates the notices with the existing tool and adds the written source offer for bundled copyleft components to the build output.

**Code:** `src/adapters/notices.ts` (repo: `vsslicer/vsslicer-build`, layer: `adapters`)

## Acceptance criteria

- [ ] `THIRD-PARTY-NOTICES` and `SOURCE-OFFER.txt` exist in every Linux artefact and are listed in the installer check
- [ ] The check fails when a bundled copyleft component has no entry
- [ ] The offer points at the release source tarball

## Tasks

- [ ] Run the notice generator over the output
- [ ] Write the source offer
- [ ] Add the presence check

## Progress

Not started.
