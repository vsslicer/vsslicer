---
id: 15
title: Add the @vscode/test-electron harness
type: feature
priority: P0
effort: M
model: sonnet
area: [ci]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-15-worker
depends_on: [14, 9]
created: 2026-10-25
---

Module: new `test-vscode` (`@vsslicer/test-vscode`, the integration harness: heavy dependencies stay out of `tooling`), used as a dev dependency by `example-extension`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

A shared runner (`tools/test-vscode`) that downloads a VS Code version, installs xvfb on Linux, runs mocha tests inside the extension host, and exposes `test:integration` per extension.

## Acceptance criteria

- [x] The sample extension activates on the `engines.vscode` minimum and on stable on the local OS
- [x] Test results and the VS Code console log are written to an artefact
- [x] The runner caches the VS Code download keyed by version
- [x] A failing test exits non-zero

## Tasks

- [x] Write the runner and mocha bootstrap
- [ ] Add xvfb handling
- [x] Add log capture (reused for CSP checks by E2)
- [x] Wire `test:integration`

## Progress

Done in `vsslicer/` (read "tools/test-vscode" as `vsslicer/modules/test-vscode`).

- `@vsslicer/test-vscode` 0.2.0: `runIntegration()` and the `vsslicer-test-vscode` CLI (`--versions min,stable`, `--cache-dir`, `--results-dir`), pure unit-tested `resolveVersion`/`cachePath`/`resultsPath` (7 vitest tests), `runner.cjs` (mocha in the extension host, xunit to `junit.xml`). `@vscode/test-electron` 3.1.0 and mocha 12.0.3 pinned. Per version `test-results/integration/<version>/`: `junit.xml`, `console.log`, `logs/`. Cache `.vscode-test/<version>/`. `--disable-extensions`, temp user-data and extensions dirs.
- `example-extension` 0.7.0: `pnpm test:integration` with `test/integration/extension.test.ts` (activate, both commands registered, hello runs, webview tab opens). Unit script is now `node --test test/*.test.ts`.
- Verified on macOS arm64, headless (no display needed): engines minimum 1.100.0 (a real release) and stable 1.143.1, 3 passing each. A deliberately wrong assertion made the run exit 1 (reverted). Empty-store `CI=true npm_config_store_dir=<tmp> pnpm install --frozen-lockfile` + lint/build/test/package OK in both modules.
- Not verified: the xvfb path (CLI re-runs under `xvfb-run -a` on Linux without DISPLAY) was written but not run, no Linux here; PLT-16 exercises it. Windows untested.
- Published (local registry): test-vscode 0.1.0-0.1.2 and 0.2.0, example-extension 0.6.0 and 0.7.0. The earlier ones were published mid-change by a concurrent `run.mjs ci` from another worker and are superseded (see notes). Dependents of example-extension keep their ranges.
- Docs: CONTRIBUTING.md "Integration tests in VS Code"; notes `.reference/notes/PLT-15-test-electron.md`.
- Files: vsslicer/modules/test-vscode/** (new); vsslicer/modules/example-extension/{package.json,pnpm-lock.yaml,CHANGELOG.md,tsconfig.json,eslint.config.mjs,.gitignore,.prettierignore,test/integration/extension.test.ts}; CONTRIBUTING.md.
