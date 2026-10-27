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