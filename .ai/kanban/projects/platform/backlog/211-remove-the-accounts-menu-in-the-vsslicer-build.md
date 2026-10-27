---
id: 211
title: Patch out the Accounts entry in the VSSlicer build
type: feature
priority: P0
effort: S
model: sonnet
area: [fork]
story: US71
milestone: "VSS:M6"
sprint: "VSS:SP15"
depends_on: [149]
created: 2026-10-27
---

D23 step 2: no Accounts entry, not just a hidden one. There's no `product.json` or setting for it: visibility is the profile storage key `workbench.activity.showAccounts`, default `true`, read by `isAccountsActionVisible` (`vscode@07f806f:src/vs/workbench/browser/parts/globalCompositeBar.ts:853-855`). Research: `docs/research/vscodium-build.md` §4.

**Code:** `patches/accounts.patch` (repo: `vsslicer/vsslicer-build`, layer: n/a (patch to VS Code's `browser/parts`))

## Acceptance criteria

- [ ] The patch makes `isAccountsActionVisible` return `false` and removes the "Accounts" toggles (`globalCompositeBar.ts:146`, `:848`); about 10 lines, header per PLT-149
- [ ] No Accounts entry in the activity bar or the title bar (`titlebarPart.ts:768-769`), on a fresh user-data dir and on one whose storage has the key set to `true`
- [ ] `pnpm check-patches` passes; the smoke test (PLT-160) checks Accounts is absent

## Tasks

- [ ] Patch
- [ ] Smoke check

## Progress

Not started.
