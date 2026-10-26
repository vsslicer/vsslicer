---
id: 9
title: "Add the CI workflow: one job per changed module on three operating systems"
type: feature
priority: P0
effort: M
model: sonnet
area: [ci]
story: US2
milestone: "VSS:M1"
sprint: "VSS:SP5"
owner: PLT-9-worker
depends_on: [8, 4, 1]
created: 2026-10-25
---

One workflow at the repository root (`working-directory: vsslicer`) that starts the local registry and builds and tests each module as its own job, only for changed modules and their dependents. The required check is named `ci` (PLT-1's ruleset). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [ ] The workflow passes on ubuntu, macOS and Windows runners for a clean clone
- [x] A change to one module runs only that module and its dependents (the selection step prints the list; asserted on a fixture change)
- [x] Actions are pinned by commit SHA; permissions are read-only by default
- [x] Concurrency cancels superseded runs

## Tasks

- [x] Write the workflow and the module selection step
- [x] Cache the pnpm store per module lockfile
- [ ] Verify on a test branch

## Progress

Local parts done; NOT moved to review (carries over): there is no GitHub remote (Q7), so nothing has run on a runner.

Done (paths under `vsslicer/` where the card says repository root):
- `.github/workflows/ci.yml`: `on` pull_request + push to main; `permissions: contents: read`; concurrency per ref with cancel-in-progress; `defaults.run.working-directory: vsslicer`. Jobs: `select` (ubuntu; `run.mjs ci --changed <base> --list`, prints and outputs the module list as JSON; base = PR base sha, push `before`, or the empty tree when unreachable, which selects everything), `build` (matrix ubuntu/macos/windows, bash shell, Node from `.nvmrc`, pnpm from `scripts/package.json` packageManager, pnpm store cached keyed by `modules/*/pnpm-lock.yaml`, `registry.sh start`, `run.mjs ci --changed <base>`, registry stop), and `ci` (the required check: passes only if select succeeded and build succeeded or was skipped because no module changed). Actions pinned by SHA (checkout v7.0.1, setup-node v7.1.0, pnpm/action-setup v6.1.0). One matrix job per OS runs all selected modules in order (not one job per module).
- `vsslicer/scripts/run.mjs`: `--list` prints the selection as JSON and exits; `ci` on a subset also installs, builds and publishes the unselected transitive dependencies (a clean runner's registry is empty) but only lints and tests the selected ones; pnpm is spawned with `shell` on win32 (pnpm is a .cmd there). `vsslicer/scripts/lib.mjs`: `withDeps`, and a change under `scripts/` or `.nvmrc` selects every module. Tests added in `scripts/test/lib.test.mjs`.

Verified locally: `node --test scripts/test/lib.test.mjs` (7 pass); actionlint 1.7.7 clean on ci.yml; selection simulated in a scratch git copy against fixture commits (gcode-api -> [gcode-api, gcode-parser]; example -> [example, example-extension]; tooling -> all; README only -> []; empty tree -> all).

Not verified / left: criterion 1 and the task "Verify on a test branch": push and observe runs on ubuntu/macos/windows (especially Windows: registry.sh under Git Bash, pnpm shell spawn, pnpm/action-setup `package_json_file` with pnpm 11, setup-node pnpm cache glob). Changing only the workflow file selects no modules (it lives outside `vsslicer/`). The subset `ci` path (dependency-only build/publish) was not run end to end.

Files: `.github/workflows/ci.yml`, `vsslicer/scripts/run.mjs`, `vsslicer/scripts/lib.mjs`, `vsslicer/scripts/test/lib.test.mjs`, `.reference/notes/PLT-9-ci.md`.
