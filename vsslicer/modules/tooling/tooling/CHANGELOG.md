# Changelog

## 0.8.4

- PLT-195: `third-party-notices` copies NOTICE, NOTICE.md and PROVENANCE.md of bundled `@vsslicer/*` packages (1 MiB cap).
- PLT-196: optional `vsslicer.extensionName` override for the VSIX id.
- PLT-197: AGPL-3.0-only is accepted for a module that ships PROVENANCE.md; source SPDX headers (check-licence and the ESLint rule) must match the package licence.

## 0.8.3

- PLT-194: `third-party-notices` takes a pinned vendored licence text (`vsslicer.licenceTexts`) for a package that ships none; the text must name its licence as a whole word or standard phrase, and stay inside the module.

## 0.8.2

- PLT-183: `third-party-notices` and `vsslicer-bundle` print one `<bin>: <message>` line and exit 1 on user errors (missing metafile, bad entry), no stack trace. `vsslicer-bundle` prints esbuild warnings and every error through `formatMessages`.
- PLT-184: `bundle(entry, outfile, cwd)` writes the metafile under `cwd`.

## 0.8.1

- `vsslicer-package`: `main` is optional (an extension pack has none), so `extension/<main>` is only required when `main` is set. A user error (invalid target, no `package.json`) prints one `vsslicer-package: <message>` line and exits 1, with no stack trace.
- All bins no longer crash when `process.argv[1]` is missing (e.g. `node -e`, a REPL).
- `check-licence` also ignores `.vscode-test`, `test-results`, `dist-test` and `.cache` (generated or downloaded).
- `vsslicer-bundle` takes an optional third argument, the working directory the esbuild metafile paths are relative to. `third-party-notices` tests use it, which fixes `ENOENT lstat` failures when the module copy lives under a symlinked `$TMPDIR`.

## 0.8.0

- `vsslicer-package` builds one VSIX per target when `"vsslicer": { "targets": ["linux-x64", "win32-x64"] }` is declared: `vsce package --target <t>`, named `<name>-<t>-<version>.vsix`, with the content assertion and size budget run on each file. No `targets`: one universal VSIX as before. New export `packAll`; `pack(cwd, target)` takes the optional target.

## 0.7.0

- Add the `vsslicer-package` bin (pins `@vscode/vsce` 3.9.2): builds `<name>-<version>.vsix` with `vsce package --no-dependencies` in a temporary copy of the module (vsce rejects scoped names; the module's `.vscodeignore` decides the content), prints the size and fails on: a manifest without `license` `AGPL-3.0-or-later`, `publisher`, a `repository` containing the release tag `<name>@<version>` or `"vsslicer": { "sizeBudgetKB": n }`; any entry besides `dist` bundles (.js/.css, no `.map`/`.meta.json`), `package.json`, `LICENSE`, `THIRD-PARTY-NOTICES.md`, `README.md`, `CHANGELOG.md`, declared assets and the VSIX manifest files, or any of those missing; a VSIX over the budget.
- Consumers' `pnpm-workspace.yaml` needs `allowBuilds` `false` for `@vscode/vsce-sign` and `keytar` (vsce's signing and keychain postinstalls).

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
