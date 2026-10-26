---
id: 15
title: Create the `printers-extension` module
type: chore
priority: P0
effort: S
model: sonnet
area: [api]
story: US4
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-14, PLT-21]
created: 2026-10-25
---

Scaffold `vsslicer/modules/printers-extension/` from the `tooling` module as a VS Code extension module (`vsslicer.printers, extensionKind ["ui"]`), so later cards add code in layers.

**Code:** `vsslicer/modules/printers-extension/` (module: `printers-extension`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `cd vsslicer/modules/printers-extension && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/printers-extension`, own lockfile, changelog, version 0.0.1)
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] `pnpm package` builds a VSIX for `vsslicer.printers, extensionKind ["ui"]` that passes the VSIX content assertion

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add package.json, tsconfig, lint and vitest config
- [ ] Add a smoke test and the CI job entry

## Progress

Not started.

Review (sp8-reviewer-15, 2026-10-26): PASS
1. Ran install, test, lint, build, package, test:integration (cached VS Code, activates and registers command): all green; `node scripts/run.mjs checks` green and the runner lists modules by directory scan, so ci picks it up. VSIX has the expected files, `extensionKind ["ui"]` in the packed manifest; `.vsix`, `dist`, `dist-test`, `test-results` are git-ignored. No project-extension leftovers except the intended PROVENANCE line.
2. Deliberate violation: a `src/domain` file importing `vscode` fails eslint (`no-restricted-imports`), proven in scratch and removed. No permanent violation test (accepted; same as project-extension).
3. Carried owner/architecture question, not a FAIL: id is `vsslicer.printers-extension`, not `vsslicer.printers`. `vsslicer-package` (tooling/bin) takes the name as `pkg.name` minus scope (`shortName`) and vsce builds the id as publisher.name. Meeting `vsslicer.printers` needs either renaming the npm package or a `vsslicer.extensionName` override in tooling: a cross-module decision.
4. Note: card says version 0.0.1, module is 0.0.0 (platform convention, SLC-100 says 0.0.0). Card text should be corrected or bumped at release. Tests use node --test like project-extension (accepted).
