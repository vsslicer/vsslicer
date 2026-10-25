# Repository audit, 2026-10-25 (during SP2)

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules
under `vsslicer/modules/`. So far it has a G-code parser, a binary G-code (.bgcode) reader, shared
tooling, test harnesses and a module runner that builds and publishes modules through a local npm
registry. The rest of the repository is research, plans and task boards.

Load assumed: one person on a desktop, opening G-code and .bgcode files of up to several hundred
MB. Some of those files come from untrusted places: downloads, model sites, printers.

Method: read the parser (`gcode-parser`), the .bgcode reader and decoders (`gcode-bgcode`), the
worker plumbing, the module runner (`vsslicer/scripts/run.mjs`), the packaging tool and CI. Findings
1 and 2 were reproduced by running the code (commands in each finding).

## Must fix

1. **A tiny .bgcode file can make the app allocate gigabytes** (`gcode-bgcode/src/domain/heatshrink.ts:L27`, `gcode-bgcode/src/adapters/deflate-codec.ts:L9`, `gcode-bgcode/src/application/read-bgcode.ts:L113`)
   - **What this is:** each .bgcode block says how big it gets once decompressed. The reader trusts that number.
   - **Problem:**
     - **Heatshrink:** the decoder allocates the declared size before it reads anything. A 4-byte block that claims 4 GB allocated 4,292 MB here before failing.
     - **Deflate:** inflation has no output limit, so a 204 KB block inflated to 210 MB before the size check.
     - **The worker's memory cap doesn't help:** these buffers live outside the JavaScript heap that the cap limits.
   - **Fix:** in `readBgcode`, reject a block whose `uncompressedSize` is over 64 MiB, or over 16 times `compressedSize` for Heatshrink, with a `block-too-large` diagnostic. Pass `{ maxOutputLength: size }` to `inflateSync`. Add one test with a 4-byte block claiming 4 GB.
   - **If we skip it:** opening one bad or hostile file freezes or crashes the editor's extension host.

2. **A plain G-code file can crash `collect`** (`gcode-parser/src/application/collect.ts:L29-L33`)
   - **What this is:** `collect` joins the parser's chunks into one file, using `push(...array)`.
   - **Problem:** spreading an array passes every element as a function argument. A 4 MB file of 840,000 `M400` lines makes one chunk with 840,000 markers, and `collect` throws "Maximum call stack size exceeded". Reproduced with `parse` and `collect` on `'M400\n'.repeat(840_000)`. Markers aren't capped per chunk: every command the machine doesn't interpret becomes one.
   - **Fix:** replace the four `push(...x)` calls with plain loops (`for (const m of c.markers) file.markers.push(m)`). Add a test with 300,000 marker lines.
   - **If we skip it:** long start or end macros, or firmware-test files, fail to open.

## Should fix

3. **Homing doesn't reset the toolhead position** (`gcode-parser/src/domain/machine.ts:L60-L104`)
   - **What this is:** the machine tracks where the toolhead is, to place every move.
   - **Problem:** `G28` (home) isn't handled; it's kept as a marker and the position stays where it was. `G1 X50` then `G28` then `G91` then `G1 X10` puts the head at X60 when it should be at X10.
   - **Fix:** handle `G28`. Set position and origin to 0 for each axis named, or for X, Y and Z when none are named. Add one test for that sequence.
   - **If we skip it:** start and end sequences with relative moves after homing draw in the wrong place, and travel and time estimates are off.

4. **Every extension module downloads its own 1.2 GB copy of VS Code for tests** (`test-vscode/src/run.ts:L39`)
   - **What this is:** the VS Code test harness downloads VS Code to run integration tests.
   - **Problem:** its default cache is `.vscode-test` in the current folder, which is the module. `example-extension/.vscode-test` is 1.2 GB already, and the plan has about 20 extension modules: around 24 GB on disk, and a download per module on each CI runner.
   - **Fix:** default the cache to one shared folder: `process.env.VSCODE_TEST_CACHE ?? join(homedir(), '.cache', 'vsslicer', 'vscode-test')`. Cache that folder in CI.
   - **If we skip it:** disks fill up and CI gets slow as extension modules are added.

5. **Stray files at the repository root** (`/package.json`, `/.vscodeignore`, both untracked)
   - **What this is:** an old copy of `example-extension`'s manifest (version 0.5.0) and its packaging ignore list.
   - **Problem:** they break the rule that all code lives in `vsslicer/`. Running `pnpm install` or `vsce package` at the root treats the whole repository as that extension.
   - **Fix:** delete both files.
   - **If we skip it:** someone packages or installs the wrong thing at the root, and the file goes stale and confuses agents.

6. **Locally, a changed dependency is silently not used** (`vsslicer/scripts/run.mjs:L139-L147`)
   - **What this is:** `run.mjs ci` publishes each module to the local registry, and dependents install it from there.
   - **Problem:** publishing is skipped when the version already exists. Edit `gcode-api` without bumping its version, run `ci`, and `gcode-parser` tests against the old published `gcode-api`, so they can pass or fail for the wrong reason. CI catches this with `version-check`; local runs don't.
   - **Fix:** in `ci`, run the existing `version-check --base HEAD` first, so uncommitted changes to a module's published files without a version bump stop the run.
   - **If we skip it:** agents and people verify cards against stale code and miss bugs.

Verdict: fix 1 and 2 first. They're the only ways a user's file can crash or freeze the editor today.

Not checked: `gcode-parser` metadata parsing of Cura settings and slicer tags beyond thumbnails;
`summary-file`; `gcode-api` types; `tooling` (`check-licence`, `third-party-notices`, the bundler);
`test-webview`; `pack`; `scripts/versioning.mjs` and `lib.mjs`; the whole test suite (not run).
The task boards, research and the taskboard skill (a separate repository) weren't audited.
