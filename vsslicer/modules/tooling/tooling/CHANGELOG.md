# Changelog

## 0.4.0

- Add the shared flat ESLint config (`@vsslicer/tooling/eslint`): typescript-eslint recommended (unused imports are errors), `import-x/no-extraneous-dependencies`, an SPDX header rule, the layer-boundary rule (`eslint-plugin-boundaries`: domain imports nothing outer, application only domain, adapters domain and application, by folder `src/<layer>/`) and `vscode` importable only from `src/presentation`.
- Add the shared Prettier config (`@vsslicer/tooling/prettier`).
- Lint fixtures with deliberate violations and a test proving each fails.
- Fix the package description.

## 0.3.0

- Add the shared vitest config (v8 coverage; text and lcov reports into `coverage/`), exported as `@vsslicer/tooling/vitest`. A plain object: consumers pin `vitest` and `@vitest/coverage-v8` themselves and wrap it with `mergeConfig`.

## 0.2.0

- Add `tsconfig.base.json` (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, NodeNext, ES2023), exported as `@vsslicer/tooling/tsconfig.base.json`.
- Add the `vsslicer-bundle` bin: bundles an extension entry to `dist/extension.js` (node, CommonJS, `vscode` external, sourcemap) with esbuild.
- Remove the placeholder `src/index.js` export.

## 0.1.0

- Initial scaffold.
