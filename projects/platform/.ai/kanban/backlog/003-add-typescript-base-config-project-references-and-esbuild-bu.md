---
id: 3
title: "Add TypeScript base config, project references and esbuild bundling"
type: feature
priority: P0
effort: M
model: sonnet
area: [monorepo]
story: US1
milestone: "VSS:M1"
depends_on: [2]
created: 2026-10-25
---

One `tsconfig.base.json`, project references between packages, and a shared esbuild helper that bundles an extension for node (the browser target is added by E48).

## Acceptance criteria

- [ ] `tsc -b` builds the sample library and extension in dependency order
- [ ] The esbuild helper produces one `dist/extension.js` bundle per extension with `vscode` external
- [ ] Strict mode, `noUncheckedIndexedAccess` and `verbatimModuleSyntax` on; documented in `CONTRIBUTING.md`
- [ ] Rebuild after touching one library rebuilds only dependants (Turborepo log)

## Tasks

- [ ] Write the base config and per-package templates
- [ ] Write `tools/bundle` esbuild helper
- [ ] Wire `build` tasks
- [ ] Document how to add a package

## Progress

Not started.
