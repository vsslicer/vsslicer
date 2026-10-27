---
id: 147
title: Pin a VSCodium release tag and build unmodified VSCodium for linux-x64 in CI
type: feature
priority: P0
effort: M
model: opus
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP15"
depends_on: [127]
created: 2026-10-25
---

Proves the pinned upstream builds on a free runner, and measures time and disk, before our changes exist. The pin is one file. Research: `docs/research/vscodium-build.md` §1 and §3 (VSCodium's own linux-x64 build job takes 12 minutes after a 7-minute compile, with caching we didn't trace; plan on 30 to 60 minutes cold).

**Code:** `upstream/vscodium.json` (tag and commit), `scripts/fetch.mjs`, `.github/workflows/build.yml` (repo: `vsslicer/vsslicer-build`, layer: `adapters` (scripts) and ci)

## Acceptance criteria

- [ ] `upstream/vscodium.json` pins a VSCodium release tag and its commit (start from the tag that carries VS Code 1.140.0, `vscodium@be70704:upstream/stable.json`); it's the only place the version lives
- [ ] `scripts/fetch.mjs` shallow-fetches that commit and checks the commit hash matches
- [ ] The workflow builds unmodified VSCodium for linux-x64 on a GitHub-hosted runner and uploads the tarball as an artifact
- [ ] Build time, peak disk and memory are recorded in `docs/build-cost.md`; if the free runner can't finish, the doc says what splits the job
- [ ] VSCodium's and VS Code's build scripts run only in CI or in a throwaway container, never on the host from `.reference` (research rule)

## Tasks

- [ ] Pin the tag
- [ ] Fetch script
- [ ] Workflow, run, record the cost

## Progress

Not started.
