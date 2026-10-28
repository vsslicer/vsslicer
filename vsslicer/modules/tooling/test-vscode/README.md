# @vsslicer/test-vscode

Integration harness for VSSlicer extensions: runs mocha suites inside a real VS Code through `@vscode/test-electron` (3.1.0, pinned), on the `engines.vscode` minimum and on stable. Heavy dependencies live here, not in `@vsslicer/tooling`.

## Use it in an extension

1. Dev dependencies: `@vsslicer/test-vscode`, `@types/mocha`, `esbuild`. Add `"mocha"` to `types` in `tsconfig.json`.
2. Write suites as `test/integration/*.test.ts` (mocha `describe`/`it`, `import * as vscode from 'vscode'`; the tooling lint rule that bans `vscode` outside `src/presentation` needs `'no-restricted-imports': 'off'` for `test/integration/**`, plus the mocha globals, see `modules/example-extension/eslint.config.mjs`).
3. Script:

```json
"test:integration": "pnpm build && esbuild test/integration/*.test.ts --bundle --platform=node --format=cjs --external:vscode --outdir=dist-test && vsslicer-test-vscode"
```

Keep the unit script off that folder (`node --test test/*.test.ts`).

## CLI

`vsslicer-test-vscode [--extension .] [--tests dist-test] [--versions min,stable] [--cache-dir <dir>] [--results-dir test-results/integration]`

- `min` is read from `engines.vscode` of `--extension` (`^1.100.0` gives `1.100.0`; it must be a released version). Other values are passed on: `stable`, `insiders` or an exact `1.101.2`.
- Each VS Code starts with `--disable-extensions`, a temporary `--user-data-dir` and `--extensions-dir` (removed afterwards) and `--logsPath` inside the results folder.
- Exit code 1 if any version fails (a failing test, a crash or a failed download).
- Linux without `DISPLAY`: the CLI re-runs itself under `xvfb-run -a` (install `xvfb`). macOS and Windows need no display setup.
- `VSSLICER_TEST_SOFTWARE_GL=1` launches VS Code with Chromium's SwiftShader switches, for WebGL on machines without a GPU (Linux CI under xvfb).
- `ELECTRON_RUN_AS_NODE` is removed from the environment (VS Code terminals set it, and the downloaded VS Code then rejects its own flags).

## Artefacts and cache (for CI)

Per version, `test-results/integration/<version>/`: `junit.xml` (mocha xunit), `console.log` (all stdout and stderr VS Code produced, the renderer console included) and `logs/` (VS Code's log folder: `main.log`, `window1/renderer.log`, `exthost`, ...). Upload `test-results/` as the artefact (`if: always()`). `test-results/` is git-ignored.

Downloads go to one cache shared by every module on the machine: `$VSCODE_TEST_CACHE`, else `~/.cache/vsslicer/vscode-test` (Windows: `%LOCALAPPDATA%\vsslicer\vscode-test`), `--cache-dir` overrides; `<version>/` inside, about 130 MB per version and platform. A second extension finds the first one's download and starts without a network call (exact versions; `stable` asks the update service which version is current, then reuses that folder). In CI cache that folder keyed on OS, the `engines.vscode` value and a week stamp for `stable`, which moves.

## API

```ts
import { runIntegration, resolveVersion, cachePath, resultsPath } from '@vsslicer/test-vscode';
const failed = await runIntegration({
  extensionDevelopmentPath: '.',
  testsDir: 'dist-test',
  versions: ['min', 'stable'],
});
```

`extensionTestsPath` overrides the bundled runner (`@vsslicer/test-vscode/runner`, which reads `VSSLICER_TESTS_DIR` and `VSSLICER_JUNIT_FILE`). The suite folder holds CommonJS `*.test.js` files.
