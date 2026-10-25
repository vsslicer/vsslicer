# Changelog

## 0.2.1

- The download cache defaults to one folder shared by every module: `VSCODE_TEST_CACHE`, else `~/.cache/vsslicer/vscode-test` (Windows: `%LOCALAPPDATA%\vsslicer\vscode-test`), instead of `.vscode-test` per module. `--cache-dir` and `cacheDir` still override. New pure helper `defaultCacheDir`. Delete old per-module `.vscode-test` folders.

## 0.2.0

- The CLI looks for compiled suites in `dist-test/` by default (was `dist/test/`, which `files: ["dist"]` would have published with the extension).

## 0.1.2

- README: document the lint overrides (`vscode` import, mocha globals, ignore `.vscode-test`) an extension needs. No code change.

## 0.1.1

- Ship `README.md` and `CHANGELOG.md` (0.1.0 was published by a concurrent `run.mjs` publish before they existed). No code change.

## 0.1.0

- `runIntegration` and the `vsslicer-test-vscode` CLI: download VS Code (`@vscode/test-electron` 3.1.0) for each of `min` (the lowest `engines.vscode`), `stable`, `insiders` or an exact version, and run a folder of compiled mocha suites inside the extension host with `--disable-extensions` and a temporary user-data and extensions dir.
- Artefacts per version in `test-results/integration/<version>/`: `junit.xml`, `console.log` (everything VS Code printed) and `logs/` (VS Code's own log folder).
- Download cache per version in `.vscode-test/<version>/`.
- Exit code 1 when any version fails; on Linux without `DISPLAY` the CLI re-runs itself under `xvfb-run`.
- Pure helpers `resolveVersion`, `cachePath`, `resultsPath`.
