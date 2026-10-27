---
id: 220
title: Remove Source Control from the VSSlicer build
type: feature
priority: P0
effort: S
model: sonnet
area: [fork]
story: US71
milestone: "VSS:M6"
sprint: "VSS:SP16"
depends_on: [218, 221]
created: 2026-10-27
---

D23 step 2 (owner, 2026-10-27). The container (`vscode@07f806f:src/vs/workbench/contrib/scm/browser/scm.contribution.ts:56-65`) is `hideIfEmpty`, but its Changes view and the "No source control providers registered." welcome (`:69-72`) keep it visible even without git, so it goes through PLT-218's list. `Ctrl+Shift+G` comes from the Changes view's open command (`:122-124`). Research: `docs/research/vscodium-build.md` §4.

**Code:** `overlay/product.json` (`vsslicer.removedViewContainers` gains `workbench.view.scm`) and `test/smoke/` (repo: `vsslicer/vsslicer-build`, layer: n/a (config))

## Acceptance criteria

- [ ] `workbench.view.scm` is listed; no Source Control entry in the activity bar or the View menu; `Ctrl+Shift+G` (`Ctrl+Shift+G` on macOS) opens nothing
- [ ] The `git`, `git-base`, `github` and `github-authentication` built-ins are on the removal list (PLT-221) and the editor starts without errors from extensions that depend on them
- [ ] The smoke test (PLT-160) checks Source Control is absent and the Explorer is present

## Tasks

- [ ] Overlay entry
- [ ] Smoke check
