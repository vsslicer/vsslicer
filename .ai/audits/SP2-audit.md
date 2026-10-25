# SP2 audit

Auditor: fresh Opus agent that wrote none of SP2's code (card VSS-41). Read-only: no code changed.
Scope: `git diff 62b9723^..f275dce -- vsslicer/ .github/` (65 commits): `vsslicer/scripts/`, modules
`tooling`, `example`, `example-extension`, `test-vscode`, `test-webview`, `pack`, `gcode-api`,
`gcode-parser`, `gcode-bgcode`, `vsslicer/fixtures/`, `.github/workflows/ci.yml`, `.github/rulesets/`.
Method: `/ponytail:ponytail-audit`, plus probes in `mktemp -d` scratch copies. The shared registry was
only read from (installs and GETs); nothing was published and it was not stopped.

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules.
After SP2 it has a G-code parser with a worker and a summary reader, a .bgcode reader, the G-code
data contract (`gcode-api`), shared tooling (lint, bundling, licence checks, VSIX packaging), test
harnesses for VS Code and webviews, and a runner that builds every module and publishes it to a
local Verdaccio registry (D12). CI runs that runner on Linux, macOS and Windows.

Load assumed: one person or a few parallel agents on a desktop, opening G-code files up to several
hundred MB, some of them untrusted; CI on shared GitHub runners (slower and noisier than a laptop).

## Earlier audit (2026-10-25-repo-audit.md): the fixes hold

1. bgcode size bombs: `MAX_BLOCK_SIZE`, the Heatshrink ratio check and `maxOutputLength` are in
   `gcode-bgcode/src/application/read-bgcode.ts:L131-L139` and `src/adapters/deflate-codec.ts:L10`, tested by
   `test/read-bgcode.test.ts:L169`. Held.
2. `collect` stack overflow: `append` loop in `gcode-parser/src/application/collect.ts:L5-L7`, test at
   `test/collect.test.ts:L13` (300,000 markers). Held.
3. G28: `test/g28.test.ts` passes. Held.
4. Shared VS Code cache: `test-vscode/src/versions.ts:L19-L23`; no module has a `.vscode-test` folder. Held.
5. Stray root `package.json` / `.vscodeignore`: gone. Held.
6. `ci` runs `version-check --base HEAD` first: `scripts/run.mjs:L78-L84`, tested in
   `scripts/test/versioning.test.mjs:L95`. Held.

Test runs (scratch copies, clean installs): scripts 0 failures; tooling 49, gcode-bgcode 33,
gcode-api 13, test-vscode 10, pack 3, gcode-parser 286, all passing when the machine is idle.

## Must fix

1. **A clean CI runner cannot build the repo: lockfiles pin @vsslicer versions only the local registry's history has** (`modules/example/pnpm-lock.yaml`, `example-extension`, `gcode-bgcode`, `test-vscode`, `test-webview`; guard at `scripts/run.mjs:L149-L161`)
   - **What this is:** each module's lockfile names the exact version of every `@vsslicer/*` package it installs. CI starts an empty Verdaccio and `run.mjs ci` publishes only each module's *current* version.
   - **Problem:** six lockfile pins are not current versions: `example` and `test-webview` pin `tooling@0.5.0`, `example-extension` and `test-vscode` pin `tooling@0.7.0`, `gcode-bgcode` pins `tooling@0.8.0` (current: 0.8.1), and `test-webview` pins `example-extension@0.3.0` (current 0.7.1). `test-webview`'s range `^0.3.0` cannot even match 0.7.1, because a caret on 0.x stops at the next minor. On a fresh registry `pnpm install --frozen-lockfile` cannot fetch them, and the runner's own lockfile-integrity guard reports "lockfile pins ..., which the registry does not serve". Locally it works only because `.registry` still holds every version ever published (it serves tooling 0.2.0 to 0.8.1).
   - **How verified:** listed each lockfile's `@vsslicer/*` entries against every module's `package.json` version, then fed them to the real `integrityProblems` from `scripts/versioning.mjs` with a lookup that serves current versions only: six problems, listed above. `curl localhost:4873/@vsslicer%2ftooling` shows the old versions exist only in the shared local registry.
   - **Fix:** bump each dependent's range to the current version (`^0.8.1` for tooling, `^0.7.1` for example-extension), re-lock, and bump those modules' versions. Then make the runner refuse it: in `ci` (and `checks`), fail when a lockfile pins an `@vsslicer/*` version other than that module's current `package.json` version. One small function next to `integrityProblems`, plus a test. That turns the D12 rule "a fresh registry has current versions only" into a check.
   - **If we skip it:** the first real CI run (or any rebuild after `.registry` is lost) fails on every OS for 5 of 9 modules, and the required `ci` check blocks every pull request.
   - **Priority:** P0. **Board:** PLT. **Module:** scripts (runner check) plus example, example-extension, gcode-bgcode, test-vscode, test-webview (lockfiles).

## Should fix

2. **Two gcode-parser tests fail when the machine is busy** (`gcode-parser/test/summary.test.ts:L114-L131`, `gcode-parser/test/worker.test.ts:L30-L38`)
   - **What this is:** one test scans 100 MB through `readSummary` and asserts it took under 5000 ms; the other parses the whole corpus twice (in-process and in a worker) under vitest's default 5000 ms test timeout.
   - **Problem:** both limits are about what an idle laptop needs. Under load they fail: "expected 5119 to be less than 5000" and "Test timed out in 5000ms". CI runners are slower than this machine, and CI runs three OSes.
   - **How verified:** clean scratch copy, `pnpm exec vitest run` three times in parallel while 8 CPU-burning `node` loops ran: one of three runs failed both tests; the idle run passed in 2.9 s.
   - **Fix:** give the corpus test an explicit timeout (`it(..., 60_000)`, like the 60 s already used in that file's setup). For the 100 MB test, keep the memory assertion (the real point) and raise the time bound to something that only catches a real regression (for example 30 s, with the test's timeout above it).
   - **If we skip it:** random red CI runs, and people learn to re-run until green.
   - **Priority:** P1. **Board:** GCP. **Module:** gcode-parser.

3. **Publishing without a build ships an empty or stale package** (every module's `package.json` except `gcode-parser`; `scripts/run.mjs:L143`)
   - **What this is:** `files: ["dist", ...]` decides what goes into the npm tarball. `dist` is build output and git-ignored.
   - **Problem:** only `gcode-parser` has a `prepack` that builds. `node scripts/run.mjs publish` (and a plain `pnpm publish` in a module) does not build first, so it publishes whatever `dist` holds: an old build, or none. gcode-parser 0.8.1 already shipped a stale `dist` this way. The registry accepts it, and since versions are immutable the bad tarball stays.
   - **How verified:** copied `gcode-api` without `dist` to a scratch folder and ran `pnpm pack`: the tarball holds only `LICENSE`, `package.json` and `README.md`, no code, and pack exits 0.
   - **Fix:** add `"prepack": "pnpm build"` to every module whose `files` lists build output (example, example-extension, gcode-api, gcode-bgcode, test-vscode, test-webview). The `ci` path builds twice for those modules; acceptable, or drop the explicit build there.
   - **If we skip it:** a dependent installs a version with no code or old code and fails in ways that look like its own bug.
   - **Priority:** P1. **Board:** PLT (one card across modules; the gcode-api/gcode-bgcode lines can be done on the same card). **Module:** example, example-extension, gcode-api, gcode-bgcode, test-vscode, test-webview.

4. **No commit in the repo is signed off, but CI requires a DCO sign-off on every PR commit** (`scripts/check-dco.mjs:L9-L19`, `.github/workflows/ci.yml:L97-L111`, `.ai/instructions.md` Conventions)
   - **What this is:** the `dco` job, part of the required `ci` check, fails a pull request if any commit lacks `Signed-off-by: <author name> <email>`.
   - **Problem:** none of SP2's 65 commits carry the trailer, and the project's commit rules (only the coordinator commits, one commit per card) never say to use `git commit -s`. The first PR made the way the project commits today fails the required check.
   - **How verified:** `git log 62b9723^..HEAD --format='%h %(trailers:key=Signed-off-by,valueonly)'`: 65 of 65 commits have no sign-off.
   - **Fix:** add "commit with `-s`" to the Conventions in `.ai/instructions.md` (and the sprint-cycle/taskboard commit step). Decide whether existing history is pushed straight to `main` (not checked) or needs `git rebase --signoff`.
   - **If we skip it:** the first pull request is red for a reason nobody on the board is told about.
   - **Priority:** P1. **Board:** PLT. **Module:** scripts / repo conventions.

5. **A summary can contain holes that crash a consumer's loop** (`gcode-parser/src/domain/summary.ts:L65-L71`, `L78-L83`)
   - **What this is:** `SummaryBuilder` stores per-extruder statistics at the index of each comma-separated value.
   - **Problem:** values that are not numbers are skipped, so if the first value of every line is unparseable (`; filament used [mm] = nan, 120.5`), index 0 is never written. `build()` keeps the hole: `extruders.length` is 2, `extruders[0]` is `undefined`, JSON shows `null`. A consumer that writes `for (const e of extruders) e.lengthMm` throws.
   - **How verified:** Node type-stripping probe on `src/domain/summary.ts` with that line and `; filament used [g] = -, 3.1`: result `{"extruders":[null,{"lengthMm":120.5,"weightG":3.1}]}`, and the `for...of` threw "Cannot read properties of undefined".
   - **Fix:** in `build()`, map over `Array.from(this.extruders, (e) => e ?? {})` so every index is an object (an extruder with no known stats). Add one test with that line.
   - **If we skip it:** an odd or hand-edited file crashes the summary view instead of showing "unknown".
   - **Priority:** P1. **Board:** GCP. **Module:** gcode-parser.

6. **The VS Code integration tests never run in CI, yet CI caches VS Code for them; the large-fixture cache caches nothing** (`.github/workflows/ci.yml:L76-L88`, `scripts/run.mjs:L141`)
   - **What this is:** `run.mjs ci` runs only `lint`, `build` and `test`. `test:integration` (example-extension) and `test:snapshot` (test-webview) are separate scripts.
   - **Problem:** so no CI job runs the integration tests that PLT-15 and PLT-176 built, while CI still restores and saves a VS Code cache keyed per week. The `large-fixtures` cache step caches `vsslicer/.cache/large-fixtures`, which nothing in CI generates or reads (only `check-fixtures.mjs` mentions the generator, in an error message).
   - **How verified:** `grep -rn "test:integration\|large-fixture"` across `scripts/`, `.github/` and module sources: no CI caller of either.
   - **Fix:** either add `test:integration` to the steps the runner runs for selected modules (xvfb on Linux) or delete the VS Code cache step; delete the large-fixtures cache step until a test uses those files. (`test:snapshot` is already carded as PLT-18.)
   - **If we skip it:** integration regressions land green, and every CI run spends time on two useless cache steps.
   - **Priority:** P1 (integration tests not run) / P2 (dead cache steps). **Board:** PLT. **Module:** .github, scripts.

## Nice to have

7. **The packaging tools print raw stack traces for simple user mistakes** (`tooling/bin/third-party-notices.mjs:L79-L88`, `tooling/bin/vsslicer-bundle.mjs:L31`)
   - **What this is:** `vsslicer-package` was fixed to print one line for user errors; its siblings were not.
   - **Problem:** `third-party-notices` with no `dist/extension.meta.json` prints a Node stack from `readFileSync`; `vsslicer-bundle` with a missing entry prints esbuild's message and then a stack trace from esbuild's internals.
   - **How verified:** ran both bins in an empty scratch folder; both exit 1 with a stack. `check-licence` in the same folder prints one clean line.
   - **Fix:** wrap each bin's main in the same `.catch((e) => (console.error(`<bin>: ${e.message}`), process.exit(1)))` that `vsslicer-package.mjs:L141-L144` uses.
   - **If we skip it:** contributors read a stack trace to learn they forgot to build.
   - **Priority:** P2. **Board:** PLT. **Module:** tooling.

8. **`bundle()` writes its metafile in the wrong folder when called with `cwd`** (`tooling/bin/vsslicer-bundle.mjs:L27`)
   - **What this is:** `bundle(entry, outfile, cwd)` tells esbuild to resolve paths from `cwd`, then writes `extension.meta.json` with a path relative to `process.cwd()`.
   - **Problem:** with a relative `outfile` and `cwd` not the current folder, esbuild writes `cwd/dist/extension.js` and then the metafile write fails with ENOENT (or lands in the caller's folder). The CLI always uses `process.cwd()`, so only the exported API is affected; the test passes absolute paths and misses it.
   - **How verified:** scratch probe `bundle('src/e.ts', 'dist/extension.js', <other dir>)` run from another folder: bundle written, then `ENOENT ... 'dist/extension.meta.json'`.
   - **Fix:** `writeFileSync(resolve(cwd, outfile).replace(/\.js$/, '.meta.json'), ...)`. One line.
   - **If we skip it:** the first script that bundles another module by `cwd` (a monorepo-style build or the pack module) breaks.
   - **Priority:** P2. **Board:** PLT. **Module:** tooling.

9. **The lockfile-integrity fetch has no retry, unlike the publish check right above it** (`scripts/run.mjs:L152-L155` vs `L116-L129`)
   - **What this is:** after publishing, `ci` fetches every module's metadata from Verdaccio to compare integrities.
   - **Problem:** `published()` retries because Node's fetch sometimes hits a keep-alive socket Verdaccio just closed (the comment says so). The integrity loop calls `fetch` with no retry, so the same blip fails the whole run at the very end.
   - **How verified:** read; the failure mode is the one documented at `run.mjs:L117`. Not reproduced.
   - **Fix:** move the retry loop into one `getMeta(name)` helper and use it in both places. Net fewer lines.
   - **If we skip it:** an occasional end-of-run failure after a full green build.
   - **Priority:** P2. **Board:** PLT. **Module:** scripts.

10. **The integration runner path breaks on folders with spaces (and is a `/C:/` path on Windows)** (`test-vscode/src/run.ts:L29`)
    - **What this is:** the default mocha runner path is built with `new URL('../runner.cjs', import.meta.url).pathname`.
    - **Problem:** `.pathname` keeps URL encoding and a leading slash: `/Users/a%20b/runner.cjs` for a folder with a space, `/C:/x/runner.cjs` on Windows. VS Code is then told to load a file that does not exist under that name.
    - **How verified:** `node -e "new URL('file:///Users/a%20b/runner.cjs').pathname"` gives `/Users/a%20b/runner.cjs`; not run inside VS Code on Windows.
    - **Fix:** `fileURLToPath(new URL('../runner.cjs', import.meta.url))`. One line.
    - **If we skip it:** integration tests fail for anyone whose checkout path has a space, and likely on Windows.
    - **Priority:** P2. **Board:** PLT. **Module:** test-vscode.

Left out: 3 smaller items (the Heatshrink ratio comment says 16x where the token math gives 8x, so the
bound is looser than stated but still safe; `registry.sh` comments "own process group" but `nohup`
does not create one; `version-check` accepts a version that goes down, not only up).

Verdict: fix 1 before the repository gets a remote: CI cannot go green on a clean runner today. Then 2, 3 and 4.

Not checked: `gcode-parser` `machine.ts`, `chunk-writer.ts`, `metadata.ts`, `slicer-tags.ts` and `arc.ts`
beyond the earlier audit's G28/collect fixes (read the tokeniser, summary, summary-file, worker host/entry, collect);
`gcode-api` `move-buffer.ts` internals; `test-webview` Playwright specs (not run: no browsers installed);
`example-extension` and `test-vscode` integration runs (would download VS Code); `apply-repo-settings.sh`
and the ruleset against GitHub (no remote); `registry.sh` and the workflow on real Windows (no Windows host:
whether `kill` of the Git Bash `$!` stops Verdaccio is unverified, harmless on an ephemeral runner);
the `readSummaryFile` 512 KiB shortcut is a marked decision and every corpus file keeps its summary within
22 KiB of an edge, so it is not reported.

## Cards

All in SP3 (`sprint: VSS:SP3`), `type: bug`, `model: sonnet`:

- Finding 1 (P0): PLT-179: Make a clean registry rebuild the repo: pin every lockfile to current @vsslicer versions
- Finding 2 (P1): GCP-80: Make the 100 MB summary test and the worker corpus test robust under load
- Finding 3 (P1): PLT-180: Add a prepack build to every module that ships dist
- Finding 4 (P1): PLT-181: Reconcile the DCO requirement with the project commit convention
- Finding 5 (P1): GCP-81: Fill holes in the summary extruders array
- Finding 6 (P1): PLT-182: Run test:integration in CI and drop the dead caches
- Finding 7 (P2): PLT-183: Print one-line errors from third-party-notices and vsslicer-bundle
- Finding 8 (P2): PLT-184: Write the bundle metafile relative to the bundle cwd
- Finding 9 (P2): PLT-185: Retry the lockfile-integrity registry fetch
- Finding 10 (P2): PLT-186: Build the test-vscode runner path with fileURLToPath
