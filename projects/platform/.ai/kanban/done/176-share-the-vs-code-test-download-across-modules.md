---
id: 176
title: Share the VS Code test download across modules
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-176-worker
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Module `test-vscode`, adapters layer. Each extension module downloads its own 1.2 GB VS Code into `.vscode-test` (finding 4). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [x] The default cache is `VSCODE_TEST_CACHE` or `~/.cache/vsslicer/vscode-test`, shared by every module
- [x] CI caches that folder
- [x] Two modules run their integration tests with one download

## Tasks

- [x] Change the default in `run.ts`
- [x] Cache step in the CI workflow
- [x] Delete the per-module `.vscode-test` folders
- [x] Release a patch version

## Progress

Done. Paths under `vsslicer/` where the card says root.

- `defaultCacheDir(env, platform, home)` (pure, in `versions.ts`, exported) written test-first (3 tests failed before). `run.ts` uses it when `cacheDir` is not given. Default: `VSCODE_TEST_CACHE`, else `~/.cache/vsslicer/vscode-test`; Windows `%LOCALAPPDATA%\vsslicer\vscode-test` (decision, documented).
- Patch 0.2.1 (only the default location moves; `--cache-dir` unchanged). example-extension 0.7.1 takes `^0.2.1`; its `.vscode-test` (1.2 GB) deleted. Both published to the local registry; empty-store `--frozen-lockfile` installs pass for both. CHANGELOGs, README of test-vscode and CONTRIBUTING updated.
- CI: `.github/workflows/ci.yml` build job caches `$RUNNER_TEMP/vscode-test` (`VSCODE_TEST_CACHE` set), key = OS + ISO week (`stable` moves) + hash of module package.json files, restore-keys on the week. YAML parses; NOT run on GitHub.
- Proof of one download: example-extension `test:integration` with an empty cache downloaded 1.100.0 and stable (1.2 GB, 64 s); a scratch extension using published test-vscode 0.2.1 then ran min,stable in 7 s with no download lines and an unchanged cache size. Also ran example-extension against the real default cache: 3 passing x2.
- Not done: xvfb/Linux and Windows paths not run here; CI cache not exercised.
- Files: modules/test-vscode/{src/versions.ts,src/run.ts,src/index.ts,test/versions.test.ts,README.md,CHANGELOG.md,package.json}; modules/example-extension/{package.json,pnpm-lock.yaml,CHANGELOG.md}; .github/workflows/ci.yml; CONTRIBUTING.md; .reference/notes/PLT-176-shared-vscode-cache.md.
