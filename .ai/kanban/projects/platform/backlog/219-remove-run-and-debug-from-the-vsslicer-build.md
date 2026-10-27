---
id: 219
title: Remove Run and Debug from the VSSlicer build
type: feature
priority: P0
effort: S
model: sonnet
area: [fork]
story: US71
milestone: "VSS:M6"
sprint: "VSS:SP16"
depends_on: [218]
created: 2026-10-27
---

D23 step 2 (owner, 2026-10-27). The container is registered at `vscode@07f806f:src/vs/workbench/contrib/debug/browser/debug.contribution.ts:453-465` and always has a view (the welcome view, `:474`), so dropping the debug extensions doesn't hide it. It goes through PLT-218's list. The Debug Console panel (`:426-433`) stays unless the owner says otherwise. Research: `docs/research/vscodium-build.md` §4.

**Code:** `overlay/product.json` (`vsslicer.removedViewContainers` gains `workbench.view.debug`) and `test/smoke/` (repo: `vsslicer/vsslicer-build`, layer: n/a (config))

## Acceptance criteria

- [ ] `workbench.view.debug` is listed; the built editor has no Run and Debug entry in the activity bar or the View menu, and `Ctrl/Cmd+Shift+D` opens nothing
- [ ] `ms-vscode.js-debug` and `js-debug-companion` are out of `builtInExtensions` (PLT-221)
- [ ] The smoke test (PLT-160) checks Run and Debug is absent

## Tasks

- [ ] Overlay entry
- [ ] Smoke check
