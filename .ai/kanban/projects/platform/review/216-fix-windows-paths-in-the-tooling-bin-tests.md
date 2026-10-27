---
id: 216
title: Fix Windows paths in the tooling bin tests
type: bug
priority: P0
effort: S
model: sonnet
sprint: "VSS:SP14"
created: 2026-10-27
---

First full GitHub CI run (run 40562150500, 2026-10-27), windows-latest: six tests in `vsslicer/modules/tooling/tooling/test/` fail with `Cannot find module 'C:\D:\a\vsslicer\...\bin\third-party-notices.mjs'`: a file URL's pathname used as a path (a leading `/D:/...` resolved again against the drive). Failing tests include "runs as a bin through a symlink", "a missing entry prints one line and exits 1, no stack", "the bin writes byte-identical output on two runs and fails without writing".

Package: `tooling`, layer: test (and `bin/` if the bins build paths the same way).

Done when: every URL-to-path conversion in `tooling` uses `fileURLToPath` (grep `pathname` and `new URL(` in `bin/` and `test/`), the tooling tests pass on windows-latest in GitHub CI, and the same grep across `vsslicer/modules` and `vsslicer/scripts` finds no other `.pathname`-as-path use (list any found as follow-up cards).
## Progress

- Changed only `vsslicer/modules/tooling/tooling/test/{bundle,notices,package}.test.mjs`: six `new URL('../bin/X', import.meta.url).pathname` became `join(import.meta.dirname, '../bin/X')`. `bin/` has no URL-to-path use (it already uses `import.meta.filename`; `createRequire(import.meta.url)` is valid). No version bump or CHANGELOG needed (test-only).
- Verified on macOS: `cd vsslicer/modules/tooling/tooling && pnpm install --frozen-lockfile && pnpm lint && pnpm test` -> 75 pass, 0 fail. Windows CI not run.
- Grep of `modules/*/*/{src,test,bin}` and `scripts` for `.pathname|new URL(|import.meta.url`: nearly all hits pass a URL object or go through `fileURLToPath` (fine on Windows). `.pathname` used as a filesystem path (would break on Windows; both point at `.reference/repos`, so likely just skipped/failing when present):
  - `vsslicer/modules/core/3mf/test/editPackage.test.ts:130`
  - `vsslicer/modules/profiles/cura/test/fdm-material.test.ts:133`
  Follow-up card: replace with `fileURLToPath(...)`.
- Not verified: `modules/apps/gcode-preview/test/panel.test.ts:164`, `load.test.ts:55,119` pass a URL to a worker (fine for `Worker`; check if any goes to `child_process`).
