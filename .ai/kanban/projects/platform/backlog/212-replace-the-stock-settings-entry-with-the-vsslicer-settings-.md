---
id: 212
title: Point the gear menu at the VSSlicer settings page and extensions view
type: feature
priority: P0
effort: M
model: opus
area: [fork]
story: US71
milestone: "VSS:M6"
sprint: "VSS:SP16"
depends_on: [218, 206]
created: 2026-10-27
---

D23 step 2. Extensions can't add items to the gear (`MenuId.GlobalActivity` isn't in `vscode@07f806f:src/vs/workbench/services/actions/common/menusExtensionPoint.ts`), so this is a patch. Stock entries: Settings at `src/vs/workbench/contrib/preferences/browser/preferences.contribution.ts:241` (and the Preferences menu at `:245`), Extensions at `src/vs/workbench/contrib/extensions/browser/extensions.contribution.ts:710`. Research: `docs/research/vscodium-build.md` §4.

**Code:** `patches/gear-menu.patch` and the gear entries in `src/vs/workbench/contrib/vsslicer/browser/vsslicer.contribution.ts` (PLT-218) (repo: `vsslicer/vsslicer-build`, layer: n/a (patch))

## Acceptance criteria

- [ ] The gear's Settings runs `vsslicer.workbench.openSettings` and its Extensions entry focuses `vsslicer-extensions` (command ids agreed with PLT-207/210 and written in the patch header)
- [ ] The stock Settings and Extensions gear entries are gone; "Preferences: Open Settings (UI)" still works from the command palette
- [ ] `Ctrl/Cmd+,` opens the VSSlicer page through a keybinding contributed by `apps/workbench`, not a patch (verify it outranks the built-in binding; if not, add it to the patch)
- [ ] `pnpm check-patches` passes; the smoke test (PLT-160) opens Settings from the gear and finds the VSSlicer page

## Tasks

- [ ] Patch and contribution entries
- [ ] Keybinding in `apps/workbench`
- [ ] Smoke check

## Progress

Not started.
