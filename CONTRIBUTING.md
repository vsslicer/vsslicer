# Contributing to VSSlicer

VSSlicer is licensed `AGPL-3.0-or-later` (see `LICENSE`). Contributions are accepted under the same licence.

## Repository

There is no remote yet: the public GitHub repository (and with it pull requests, the `ci` check and a protected `main`) waits on an owner decision (Q7). Until then the repository is local, nothing is published anywhere, and this section will gain the URL, the branch rules and the issue templates once it exists.

## Setup

- Node 24 (`vsslicer/.nvmrc`) and pnpm 11.
- Modules resolve each other through a local npm registry (Verdaccio, D12). From `vsslicer/`:

```sh
scripts/registry.sh start          # http://localhost:4873, storage in vsslicer/.registry/
node scripts/run.mjs ci            # per module, in dependency order: install, lint, build, test, publish; then the repository checks
scripts/registry.sh stop
```

- `node scripts/run.mjs checks`: repository checks that aren't a module's own tests (the phantom-dependency fixture must fail its build; every module's pnpm settings stay strict; `check-licence` over every module and the fixtures dir).
- `node scripts/run.mjs checks` also runs `scripts/check-fixtures.mjs`: no file under a `fixtures/` folder (`vsslicer/fixtures/` and `modules/*/test/fixtures/`) over 5 MB, and every folder directly under such a root has a `PROVENANCE.md` (generator, version, settings, licence). `modules/tooling/test/fixtures` (hand-written lint/licence violations) is exempt from `PROVENANCE.md` only. Loose files directly in a root (e.g. `manifest.json`) need none.
- Inputs too big to commit (the 50, 200 and 500 MB G-code budget files) come from `node scripts/generate-large-fixture.mjs --kind gcode --size 500MB --seed 1 --out .cache/large-fixtures/500mb.gcode`: same kind, size, seed and generator version give byte-identical output (size within 1%); exit 0 written, 1 failed, 2 bad arguments or not implemented (currently a stub, filled in by the G-code parser cards). `.cache/` is git-ignored; CI caches `.cache/large-fixtures` keyed by the generator's hash.
- Other runner commands: `node scripts/run.mjs <install|build|test|publish>`, and `--changed <git-ref>` to limit any of them to modules changed since that ref and their dependents.
- One module on its own (its dependencies must already be published, which `ci` does):
  `cd vsslicer/modules/<name> && pnpm install && pnpm test && pnpm build`.
- The runner's own tests: `cd vsslicer/scripts && node --test test/`.

## Layout

```
vsslicer/
  modules/<name>/   one independent module each: package.json, lockfile, CHANGELOG.md, LICENSE, tests, build
  scripts/          registry.sh (Verdaccio), run.mjs (the runner) and its tests
  fixtures/         shared test data
```

Research (`docs/`), plans and task boards live outside `vsslicer/`. Only files a tool requires at the repository root (`.github/`, `LICENSE`, this file) stay there.

## Architecture rules

All code lives in `vsslicer/`; every capability is its own module; layers (domain, application, adapters, presentation) point inward and the VS Code API appears only in presentation; an import-boundary lint enforces it. The full rules are in `.ai/instructions.md` "Architecture rules". Every source file starts with `// SPDX-License-Identifier: AGPL-3.0-or-later` (`#` in shell).

## TypeScript and bundling

`@vsslicer/tooling` (a dev dependency of every module) provides the shared build config:

- `tsconfig.base.json`: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly` (so Node can run `.ts` tests directly), target ES2023, `module`/`moduleResolution` `NodeNext`. Relative imports carry the `.ts` extension (`import { x } from './x.ts'`); `tsc` rewrites them in the output. Modules extend it: `"extends": "@vsslicer/tooling/tsconfig.base.json"`.
- `vsslicer-bundle [entry] [outfile]`: esbuild bundle of a VS Code extension to one `dist/extension.js` (node, CommonJS, `vscode` external, sourcemap). Defaults: `src/presentation/extension.ts` to `dist/extension.js`.
- Each module pins its own `typescript` (and `@types/node`), so `tsc` runs from the module. Library modules are `"type": "module"` and build with `tsc` (emit `dist` and `.d.ts`). Extensions stay CommonJS (VS Code `require`s `dist/extension.js`), override `module: Preserve` / `moduleResolution: Bundler` with `noEmit`, and build with `tsc && vsslicer-bundle`; pin `@types/vscode` to the `engines.vscode` minimum.
- Tests are `.ts` files under `test/`. Libraries run them with vitest: pin `vitest` and `@vitest/coverage-v8` (same exact version) as devDependencies (pnpm does not expose transitive bins), add `vitest.config.ts` = `mergeConfig(base, defineConfig({}))` with `import base from '@vsslicer/tooling/vitest'` (v8 coverage, `text` + `lcov` into `coverage/`), and scripts `"test": "vitest run"` and `"test:coverage": "vitest run --coverage"`. A failing test exits non-zero. Modules with nothing to gain (the extension) may stay on `node --test test/` (type stripping, no build step). Keep the VS Code API out of anything a test imports: `import type` it, and pass it in (see `modules/example-extension/src/presentation/`).
- esbuild reaches modules through tooling, so each module needs `allowBuilds: { esbuild: false }` in its `pnpm-workspace.yaml` (its binary is an optional dependency), and `minimumReleaseAgeExclude: ['@vsslicer/*']` for our own fresh packages.

## Lint and format

`@vsslicer/tooling` also ships the shared ESLint flat config (`@vsslicer/tooling/eslint`) and Prettier config (`@vsslicer/tooling/prettier`). `pnpm lint` in a module runs `eslint .`, `prettier --check .` and the type check; `pnpm format` runs `prettier --write .`. The ESLint config enforces:

- typescript-eslint recommended, so unused imports and variables are errors (prefix an intentionally unused argument with `_`).
- `import-x/no-extraneous-dependencies` as an error: import only what the module's `package.json` declares (dev dependencies only from `test/` and `*.config.*` files).
- The SPDX header: the first comment of every `.ts`, `.mjs` and `.js` file (after a shebang) is `// SPDX-License-Identifier: AGPL-3.0-or-later`.
- The layer rule, by folder `src/<layer>/`: `domain` imports nothing from the other layers, `application` only `domain`, `adapters` only `domain` and `application`, `presentation` anything. A violation fails with `boundaries/dependencies`.
- `vscode` may be imported (even as a type) only under `src/presentation/`.

The deliberate violations that prove each rule fail live in `modules/tooling/test/fixtures/lint/` (excluded from the normal lint) and are asserted by `modules/tooling/test/lint.test.mjs`.

### Licence check

`check-licence [dir...]` (a bin of `@vsslicer/tooling`; default the current directory) fails with `<file>: <rule>: <message>` for:

- `package-license`: `package.json` lacks `"license": "AGPL-3.0-or-later"`.
- `spdx-header`: a `.ts`, `.tsx`, `.js`, `.mjs`, `.cjs`, `.sh`, `.glsl` or `.wgsl` file lacks `SPDX-License-Identifier: AGPL-3.0-or-later` in its first 5 lines (after a shebang).
- `ported-copyright`: a line `Ported from <project>@<commit>:<path>` (D2) has no line containing `Copyright` within 5 lines before or after it. Put the upstream notice right under the provenance line.

Ignored: `node_modules`, `dist`, `coverage`, `.git` and `test/fixtures` at any depth. Tooling's own `lint` runs it on itself; `node scripts/run.mjs checks` (and so `ci`) runs it over every module and `fixtures/phantom-dep`, which is where the repository-wide "lint" gate lives. Fixtures: `modules/tooling/test/fixtures/licence/`, asserted by `test/licence.test.mjs`.

Adopting it in a module:

1. `devDependencies`: `@vsslicer/tooling` (`^0.5.0` or later), plus `eslint` and `prettier` pinned to the tooling versions (pnpm does not expose transitive bins).
2. `eslint.config.mjs`: `// SPDX-License-Identifier: AGPL-3.0-or-later` then `export { default } from '@vsslicer/tooling/eslint';`.
3. `package.json`: `"prettier": "@vsslicer/tooling/prettier"`, `"lint": "eslint . && prettier --check . && tsc --noEmit"` (extensions: `tsc`), `"format": "prettier --write ."`.
4. `.prettierignore` with `dist`, `coverage`, `pnpm-lock.yaml`.
5. `pnpm-workspace.yaml`: `allowBuilds: { unrs-resolver: false }` (next to esbuild).

### Third-party notices

`third-party-notices [--out THIRD-PARTY-NOTICES.md] [metafile...]` (a bin of `@vsslicer/tooling` 0.6.0 or later; default metafile `dist/extension.meta.json`) runs after bundling. `vsslicer-bundle` writes the esbuild metafile next to the bundle; for any other esbuild call add `--metafile=dist/<name>.meta.json` and pass it. It maps every inlined input file to its owning package (pnpm's `.pnpm/<name>@<ver>/node_modules/<name>` layout and scoped names included; the module's own sources and `@vsslicer/*` are skipped), evaluates each package's SPDX `license` (or legacy `licenses`) expression and writes `THIRD-PARTY-NOTICES.md`: sorted by `name@version`, with the text of every LICENSE/COPYING/NOTICE file, no timestamps, so two runs are byte-identical. An extension with no third-party dependency gets a file saying so.

- Allow-list (AGPL-3.0-compatible): AGPL-3.0, GPL-3.0, GPL-2.0-or-later, LGPL-2.1, LGPL-3.0 (each with `-only`/`-or-later`), MIT, MIT-0, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, 0BSD, Zlib, CC0-1.0, Unlicense, BlueOak-1.0.0, MPL-2.0. `GPL-2.0-only` is not compatible. Sources are in `modules/tooling/bin/spdx.mjs`.
- `OR`: one allowed branch is enough (`MIT OR GPL-3.0`, `GPL-2.0-only OR MIT`). `AND`: all terms must be allowed (`MIT AND GPL-2.0-only` fails). `WITH` is judged on the base licence; `X+` counts as "or later".
- Fails (exit 1, nothing written, message names `name@version`): `UNLICENSED`, no licence, a licence off the list, an expression that does not parse (including `SEE LICENSE IN ...`), or a package without a licence file.
- Wire it into the extension build after the bundles, and ship the file: `"build": "tsc && vsslicer-bundle && third-party-notices"`, `"files": ["dist", "!dist/*.meta.json", "THIRD-PARTY-NOTICES.md", ...]`, and `THIRD-PARTY-NOTICES.md` in `.prettierignore` (see `modules/example-extension`). Tests build fake pnpm-layout trees at run time: `modules/tooling/test/notices.test.mjs`.

### VSIX package

`vsslicer-package` (a bin of `@vsslicer/tooling` 0.7.0 or later, wrapping `@vscode/vsce` 3.9.2) is every extension module's `"package": "vsslicer-package"`; run `pnpm build && pnpm package`. It writes `<name>-<version>.vsix` (git-ignored) into the module, prints the size and exits 1 with one line per problem:

- Content, exactly: `extension/dist/*.js|css` (no `.map`, no `.meta.json`), `package.json`, `LICENSE`, `THIRD-PARTY-NOTICES.md`, `README.md`, `CHANGELOG.md`, declared assets (`icon` and any existing file named in `contributes`) and the VSIX's own manifest files; `main` must exist. Nothing else (no `node_modules`, `src`, tests); `content: unexpected <entry>` / `content: missing <entry>`.
- Size: `"vsslicer": { "sizeBudgetKB": 200 }` in `package.json` is required; a larger VSIX fails.
- Manifest: `license` `AGPL-3.0-or-later`, `publisher` (`vsslicer`; no marketplace account yet, Q8) and `repository` whose URL contains the release tag `<name>@<version>` (the module directory name, not the scoped name). Until the remote exists (Q7) use the placeholder `https://github.com/<owner>/VSSlicer/tree/<name>@<version>/vsslicer/modules/<name>`, and change the version in it with every bump.

How it works: vsce runs with `--no-dependencies` in a temporary copy of the module (no `node_modules`; vsce rejects scoped names, so the copy gets the unscoped one). vsce ignores negations in `package.json` `files`, so the module's `.vscodeignore` decides the content; copy the whitelist from `modules/example-extension/.vscodeignore` (`**`, then `!dist/*.js`, `!LICENSE`, ...). Add `!media/**` etc. for assets. The module's `pnpm-workspace.yaml` needs `allowBuilds` `false` for `@vscode/vsce-sign` and `keytar`. Tests build a fake extension at run time: `modules/tooling/test/package.test.mjs`.

## Adding a module

1. Copy `modules/example` (library) or `modules/example-extension` (extension) to `modules/<name>`; rename it in `package.json`, start at version `0.1.0`, reset `CHANGELOG.md`, keep `LICENSE`, `.npmrc` and `pnpm-workspace.yaml`.
2. Put code in the layers (`src/domain`, `application`, `adapters`, `presentation`) with the SPDX header; `"license": "AGPL-3.0-or-later"`.
3. Depend on other modules only by semver range on the `@vsslicer/*` package, tooling as `devDependency`. Start the registry, then `pnpm install` in the module to create its lockfile.
4. `pnpm build && pnpm test`, then `node scripts/run.mjs ci` from `vsslicer/` to check it in order with the rest. The runner finds the module by itself.
5. When you change the published files of a module others depend on, bump its version with a changelog entry, publish it, and regenerate each dependent's lockfile (`rm pnpm-lock.yaml && pnpm install`). Prove each with `pnpm install --frozen-lockfile --store-dir <empty tmp dir>` (the normal store hides stale integrity hashes).

## Sign-off (DCO)

We use the Developer Certificate of Origin, not a CLA; copyright stays with each contributor (D10). Sign every commit:

```sh
git commit -s
```

## Versions and releases

A module's published content changes only with a version bump and a `CHANGELOG.md` entry. A release is the tag `<name>@x.y.z`. The publish step never overwrites a version, so dependents' lockfile hashes stay valid.

- `cd vsslicer && node scripts/run.mjs version-check --base <ref>` (CI runs it in the `select` job against the PR base, or the previous commit on push): for each module whose published files changed since `<ref>` (`src/`, anything in `files`, `package.json`; tests, fixtures, docs and other Markdown are exempt), `package.json` must carry a different version and `CHANGELOG.md` a `## x.y.z` entry. New modules need the entry for their first version. The failure names the module.
- `node scripts/run.mjs release --dry-run <module-folder>` prints the `CHANGELOG.md` section of the module's current version and the tag `<folder>@x.y.z` (e.g. `example-extension@0.4.0`) without creating it. The tag itself is created at release time.
- `node scripts/run.mjs ci` ends with a lockfile-integrity guard: every `@vsslicer/*` entry in each module's `pnpm-lock.yaml` must match the `dist.integrity` the registry serves for that version, otherwise it fails naming both modules (the dependency changed after publishing without a bump; the local pnpm store hides this, a clean one does not).
- `node scripts/run.mjs checks` also requires every module's `publishConfig.registry` and `.npmrc` (`@vsslicer:registry=`) to be `http://localhost:4873/` until D10's registries exist, and rejects any `registry.npmjs.org` reference for `@vsslicer` packages.
- A `modules/<dir>` without a `package.json` yet (being created) is skipped with a warning.

## Why independent modules

Each module can be built, tested, published alone or moved to its own repository unchanged, and depends on others only through semver ranges on their published packages (D12). Rejected:

- A pnpm workspace with Turborepo: built first, then replaced; the owner wants no root workspace or lockfile.
- `link:` / `file:` dependencies on sibling folders: relative paths into other modules, and they never exercise a real published version.
- GitHub Packages: needs the remote repository and tokens (Q7), so the registry stays local for now.
