---
id: 126
title: Publish index.json on GitHub Pages (marketplace 0.1.0)
type: chore
priority: P0
effort: XS
model: sonnet
area: [registry]
story: US72
milestone: "VSS:M6"
sprint: "VSS:SP16"
depends_on: [223, 125]
created: 2026-10-25
---

The first published marketplace (D24): a workflow regenerates `index.json` and deploys it with the site to GitHub Pages, on a schedule, on manual dispatch and on a `repository_dispatch` from a VSSlicer release.

**Code:** `.github/workflows/pages.yml` (repo: `vsslicer/vsslicer-marketplace`, layer: n/a (ci))

## Acceptance criteria

- [ ] The workflow runs the generator (PLT-223), validates the result against the schema (PLT-222), and deploys `index.json`, `schema.json` and the site to Pages
- [ ] A run with no new releases produces a byte-identical `index.json` and deploys nothing new
- [ ] The published URL is recorded in the README and in `apps/workbench`'s default `vsslicer.workbench.marketplaceUrl`
- [ ] `vsslicer-marketplace@0.1.0` is tagged with a changelog entry

## Tasks

- [ ] Pages workflow
- [ ] Tag and changelog

## Progress

Not started.
