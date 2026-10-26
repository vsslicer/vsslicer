---
id: 406
title: "Pass file paths, not URL paths, to admesh in the mesh oracle test"
type: bug
priority: P2
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 15 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Fixed in mesh/test/oracle/admesh.test.ts: `fixturePath` = `fileURLToPath(new URL(f, dir))`, used for the fixture loop. Test 'fixturePath decodes a space in the directory' runs without admesh.
Probe (criterion 1): reverted helper to `join(base.pathname, f)`: that test failed (1 failed, 7 passed); restored. Bounds: no input parsed or looped beyond the existing fixed fixture list; nothing new to bound.
Verify: mesh lint, build, test (91 passed, 1 skipped) pass; `node scripts/run.mjs checks` exit 0. Release lines: none (test-only). CI gate platform: Linux (admesh installed there).

**Review failed (sp12-rev-vwr-406)**

Ran in vsslicer/modules/mesh: `pnpm install`, `pnpm lint`, `pnpm build` pass; `pnpm test` 91 passed, 1 skipped (12 files + 1 skipped file). admesh 0.98.5 is installed on this Mac, so `vitest run test/oracle` ran the real oracle: 8 passed. `node scripts/run.mjs checks` exit 0.
Probe (criterion 1): reverted the helper to `join(base.pathname, f)`: 'fixturePath decodes a space in the directory' fails (1 failed, 7 passed); restored, diff unchanged. Bounds: no new input parsing or looping; nothing to bound. Layering: test-only, no cross-module imports.

1. `mesh/test/oracle/admesh.test.ts:18` — the new test fails on the windows-latest CI leg. It runs everywhere (not gated on admesh), and the build matrix in `.github/workflows/ci.yml:59` includes windows-latest. On Windows `fileURLToPath('file:///tmp/my%20projects/a%20b.stl')` throws `ERR_INVALID_FILE_URL_PATH` (no drive letter); probe: `node -e "require('node:url').fileURLToPath('file:///tmp/my%20projects/a%20b.stl',{windows:true})"` throws. Even with a drive letter the expected `/tmp/my projects/a b.stl` would be `\`-separated. Expected fix (rule: a test that runs on every OS builds its fixture and its expectation from the platform's path API, never a hard-coded POSIX path): e.g. `const base = join(tmpdir(), 'my projects');` and `expect(fixturePath('a b.stl', pathToFileURL(base + sep))).toBe(join(base, 'a b.stl'))`; then re-run the revert probe.

**Rework (sp12-vwr-406b)**

Fixed review finding 1: the test builds its expectation from the platform path API: `base = join(tmpdir(), 'my projects')`, `fixturePath('a b.stl', pathToFileURL(base + sep))` expected `join(base, 'a b.stl')`. Also replaced every other `new URL(..).pathname` file path in mesh tests with `fileURLToPath(new URL(..))`: test/worker-web-browser.test.ts (esbuild, entry), test/bench/run.ts (child script, generator), test/bench/chromium-case.ts (esbuild, entry).
Probe (criterion 1): reverted helper to `join(base.pathname, f)`: the test fails (1 failed, 7 passed); restored. The other pathname swaps are mechanical on POSIX; no new test (each is exercised by worker-web-browser/bench when playwright is present).
Verify: mesh lint, build, test (91 passed, 1 skipped) pass; `node scripts/run.mjs checks` exit 0. Release lines: none (test-only). CI gate platform: Linux (admesh installed there); the test now also runs on windows-latest.

**Review passed (sp12-rev2-vwr-406)**

Ran in vsslicer/modules/mesh: `pnpm install`, `pnpm lint` (eslint, prettier, tsc) and `pnpm build` pass. `pnpm test` gave 91 passed, 1 skipped (12 files + 1 skipped) on three of four runs. The first run reported a failure, but its output was cut off and three reruns (one after a fresh build) were green. The diff only changes test path helpers, so that run looks like load flakiness. `vitest run test/oracle` with real admesh 0.98.5: 8 passed. `node scripts/run.mjs checks` exit 0.
Previous finding 1 (Windows): fixed. Probe: simulated with `path.win32` and `{windows:true}`. `pathToFileURL(join(Temp,'my projects')+sep)` gives `file:///C:/.../my%20projects/`. `fileURLToPath` of `a b.stl` against it equals `win32.join(base,'a b.stl')` (true), so the expectation now comes from the platform path API.
Probe (criterion 1): reverted the helper to `join(base.pathname, f)`. 'fixturePath decodes a space in the directory' fails (1 failed, 7 passed). Restored from backup; diff unchanged.
Criterion 2 (bounds): no new parsing, scanning or looping over input; nothing to bound. The extra `.pathname` -> `fileURLToPath` swaps (worker-web-browser test, bench run.ts, chromium-case.ts) are mechanical. `grep .pathname` over mesh src/test/scripts finds none left. Layering: test-only, no cross-module imports.
