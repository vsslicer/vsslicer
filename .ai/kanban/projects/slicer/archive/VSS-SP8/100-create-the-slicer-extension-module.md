---
id: 100
title: Create the `slicer-extension` module
type: chore
priority: P0
effort: S
model: sonnet
area: [tasks]
story: US18
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-14, PLT-21]
created: 2026-10-25
---

The `vsslicer.slicer` extension: engine registry and settings, `Slicer.slice` export, the slice pipeline, post-processing, tasks, problem matchers and commands. Presentation only touches the VS Code API; the pipeline and post-processing run in plain Node.

**Code:** `vsslicer/modules/slicer-extension/` (module: `slicer-extension`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/slicer-extension`, version `0.0.0` and `AGPL-3.0-or-later`
- [ ] The extension activates in `@vscode/test-electron` and a VSIX packs (PLT-21) with id `vsslicer.slicer`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.

Review (sp8-reviewer-15, 2026-10-26): PASS
1. Ran install, test, lint, build, package, test:integration (cached VS Code, activates, command registered): all green; `run.mjs checks` green; module picked up by directory scan. Package `@vsslicer/slicer-extension`, 0.0.0, AGPL-3.0-or-later. Artefacts git-ignored; no project-extension leftovers except the intended PROVENANCE line.
2. Deliberate violation: `vscode` import in `src/domain` fails eslint (`no-restricted-imports`), proven in scratch and removed.
3. Carried owner/architecture question, not a FAIL: VSIX id is `vsslicer.slicer-extension`, not `vsslicer.slicer`, because `vsslicer-package` derives the name from the unscoped package name (tooling `shortName`). Meeting the card needs an npm rename or a tooling override: cross-module decision.
4. node --test instead of vitest (accepted, as project-extension).
