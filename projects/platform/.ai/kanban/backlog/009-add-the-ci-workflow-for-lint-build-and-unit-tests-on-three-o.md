---
id: 9
title: "Add the CI workflow for lint, build and unit tests on three operating systems"
type: feature
priority: P0
effort: M
model: sonnet
area: [ci]
story: US2
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [8, 4, 1]
created: 2026-10-25
---

GitHub Actions workflow on pull requests and `main`: ubuntu, macos and windows, pnpm install with frozen lockfile, Turborepo, local cache saved with `actions/cache`. Free minutes only, no remote cache (D5).

## Acceptance criteria

- [ ] The workflow passes on all three runners for a clean clone
- [ ] A second run with the restored cache shows Turborepo cache hits for unchanged packages (printed in the log, asserted by a step)
- [ ] Actions are pinned by commit SHA; permissions are read-only by default
- [ ] Concurrency cancels superseded runs

## Tasks

- [ ] Write `.github/workflows/ci.yml`
- [ ] Configure cache keys on lockfile and Turborepo hash
- [ ] Add the cache-hit assertion step
- [ ] Document how to run the same commands locally

## Progress

Not started.
