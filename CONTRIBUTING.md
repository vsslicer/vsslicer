# Contributing to VSSlicer

VSSlicer is licensed `AGPL-3.0-or-later` (see `LICENSE`). Contributions are accepted under the same licence.

## Repository

There is no remote yet: the public GitHub repository (and with it pull requests, the `ci` check and a protected `main`) waits on an owner decision (Q7). Until then the repository is local, nothing is published anywhere, and this section will gain the URL, the branch rules and the issue templates once it exists.

## Setup

- Node 24 (`vsslicer/.nvmrc`) and pnpm 11.
- Modules resolve each other through a local npm registry (Verdaccio, D12). From `vsslicer/`:

```sh
scripts/registry.sh start          # http://localhost:4873, storage in vsslicer/.registry/
node scripts/run.mjs ci            # per module, in dependency order: install, lint, build, test, publish
scripts/registry.sh stop
```

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

Adopting it in a module:

1. `devDependencies`: `@vsslicer/tooling` (`^0.4.0` or later), plus `eslint` and `prettier` pinned to the tooling versions (pnpm does not expose transitive bins).
2. `eslint.config.mjs`: `// SPDX-License-Identifier: AGPL-3.0-or-later` then `export { default } from '@vsslicer/tooling/eslint';`.
3. `package.json`: `"prettier": "@vsslicer/tooling/prettier"`, `"lint": "eslint . && prettier --check . && tsc --noEmit"` (extensions: `tsc`), `"format": "prettier --write ."`.
4. `.prettierignore` with `dist`, `coverage`, `pnpm-lock.yaml`.
5. `pnpm-workspace.yaml`: `allowBuilds: { unrs-resolver: false }` (next to esbuild).

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

## Why independent modules

Each module can be built, tested, published alone or moved to its own repository unchanged, and depends on others only through semver ranges on their published packages (D12). Rejected:

- A pnpm workspace with Turborepo: built first, then replaced; the owner wants no root workspace or lockfile.
- `link:` / `file:` dependencies on sibling folders: relative paths into other modules, and they never exercise a real published version.
- GitHub Packages: needs the remote repository and tokens (Q7), so the registry stays local for now.
