---
id: 283
title: Refuse symlink chains that escape the extraction folder on Windows
type: bug
priority: P0
effort: M
model: opus
sprint: "VSS:SP14"
owner: SLC-283-worker
created: 2026-10-28
---

Security. GitHub CI (run 40669283264, windows-latest, 2026-10-28): `vsslicer/modules/slicer/runtime/test/extract-archive.test.ts` > "extractArchive: tar.gz > refuses [{name:'sub/c',type:'2',link:'..'},{name:'sub/e',type:'2',link:'c/../..'}]" fails: `promise resolved { format: 'tar.gz', entries: 3, … } instead of rejecting`. A symlink chain whose combined target escapes the destination is accepted on Windows; Linux and macOS refuse it. `extractArchive` unpacks downloaded slicer engines (D-level trust boundary).

Module: `slicer-runtime` (`slicer/runtime`), layer: adapters (`src/adapters/extract-archive.ts`).

Find why the escape check passes on Windows (likely `path.resolve`/`relative` with `\` vs `/` link targets, drive letters, case-insensitive prefixes, or symlink creation semantics: junctions/file vs dir links, or links not created at all so the check runs on a different state). Fix at the root for every platform, keep the existing guards, add a unit test that exercises the Windows path logic on any OS (`path.win32`) if the check is path arithmetic.

Done when: the test passes on windows-latest in GitHub CI and still on Linux/macOS; a review of every other escape case in the file for the same Windows gap is recorded; patch bump + CHANGELOG; dependents re-locked (publish only via `node scripts/run.mjs publish`; `pnpm cache delete '@vsslicer/*'` before re-locking; verify integrities against the registry).
## Progress

- Root cause: the lexical guard (`resolve(sub, 'c/../..')` = root) passes on every OS; POSIX then catches the chain with realpath because the kernel follows `sub/c -> ..` before the `..`. Windows resolves `..` in a relative link target lexically, so on disk `sub\e` really is the root and realpath passes too. The tree still escapes for any POSIX reader (WSL, MSYS, a copy to Linux).
- Fix: `checkSymlinkChains` (exported, pure, archive-relative names, no `node:path`) resolves every link through the archive's other links the POSIX way and refuses any step above the root, loops (>40 hops) and runaway work; run in `finish()` before any link is created. All earlier guards kept.
- Tests: unit tests on any OS, including a `path.win32.resolve` case that documents the lexical result; the existing tar.gz case kept.
- Other cases reviewed (notes: `.reference/notes/SLC-283-windows-symlink-escape.md`): hard links, absolute/drive/UNC/backslash targets, backslash and `..` in entry names are covered by platform-independent checks. Found, not fixed: Windows-only names (`:` ADS, reserved device names like `COM1`), suggested as a separate card.
- slicer-runtime 0.0.1 (CHANGELOG `## 0.0.1`), published via `run.mjs publish`; no module pins it, nothing to re-lock. Module lint+test and `node scripts/run.mjs ci` pass on macOS. Windows CI still to confirm.
