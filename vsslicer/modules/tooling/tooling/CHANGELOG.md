# Changelog

## 0.6.0

- Add the `third-party-notices` bin: reads the esbuild metafile(s), finds the packages that were inlined (skipping the module's own sources and `@vsslicer/*`), checks each package's SPDX licence expression (`OR`, `AND`, `WITH`, parentheses, `+`) against an AGPL-3.0-compatible allow-list, and writes a deterministic `THIRD-PARTY-NOTICES.md` with the licence text of every package. `UNLICENSED`, a missing or non-allow-listed licence, a non-SPDX `SEE LICENSE IN`, or a missing licence file fail with `name@version` and exit 1.
- `vsslicer-bundle` now also writes the esbuild metafile next to the bundle (`dist/extension.meta.json`).

## 0.5.0

- Add the `check-licence` bin: fails on a missing `"license": "AGPL-3.0-or-later"` in `package.json`, a source file (.ts .tsx .js .mjs .cjs .sh .glsl .wgsl) without the SPDX header in its first 5 lines, and a `Ported from <project>@<commit>:<path>` line without a `Copyright` line within 5 lines. Ignores node_modules, dist, coverage, .git and test/fixtures.

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
