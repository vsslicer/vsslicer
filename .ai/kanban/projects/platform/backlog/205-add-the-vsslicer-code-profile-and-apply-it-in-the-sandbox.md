---
id: 205
title: Add the VSSlicer .code-profile and apply it in the sandbox
type: feature
priority: P0
effort: M
model: opus
area: [fork]
story: US70
milestone: "VSS:M3"
sprint: "VSS:SP14"
created: 2026-10-27
---

A `VSSlicer` VS Code profile (D23 step 1) that hides Accounts, Source Control, Run and Debug and Extensions from the activity bar and carries the settings now hard-coded in `vsslicer/scripts/sandbox.mjs` (git off, AI features off, recommendations off, updates and telemetry off). `sandbox.mjs` then applies it, so the sandbox and a user importing the profile get the same workbench.

**Code:** `vsslicer/scripts/vsslicer.code-profile`, `vsslicer/scripts/sandbox.mjs`, `vsslicer/scripts/test/` (module: none, scripts; layer: n/a (tooling))

## Finding: where VS Code keeps this state (vscode@4ef6bab, `.reference/repos/vscode`)

- Pinned view containers: storage key `workbench.activity.pinnedViewlets2` (`src/vs/workbench/browser/parts/activitybar/activitybarPart.ts:93`), a JSON array of `{id, pinned, visible, order?}` (`src/vs/workbench/browser/parts/paneCompositeBar.ts:46`), stored `StorageScope.PROFILE, StorageTarget.USER` (`paneCompositeBar.ts:701`). `visible` is being migrated to workspace state, so `pinned: false` is what hides an icon per profile.
- Accounts: key `workbench.activity.showAccounts`, boolean, `PROFILE`/`USER` (`src/vs/workbench/browser/parts/globalCompositeBar.ts:277, 867`).
- Ids: `workbench.view.scm`, `workbench.view.debug`, `workbench.view.extensions`.
- A `.code-profile` carries these in its `globalState` resource, `{"storage": {key: string}}`; only `StorageTarget.USER` keys are exported and imported (`src/vs/workbench/services/userDataProfile/browser/globalStateResource.ts:19-88`).
- The CLI can't import a `.code-profile` (`--profile` takes a name). Unverified: the sandbox can write the same keys into `<user-data-dir>/User/globalStorage/state.vscdb` (SQLite `ItemTable`) with Node 24's built-in `node:sqlite` before launch. Verify this first; if VS Code overwrites them on start, record why and pick another way (for example a first-run import through the profile URL handler). Notes: `.reference/notes/VSS-E70-planning.md`.

## Acceptance criteria

- [ ] `vsslicer/scripts/vsslicer.code-profile` imports through Profiles > Import Profile in stock VS Code and gives a workbench with no Accounts icon and no Source Control, Run and Debug or Extensions icons; each stays reachable from the command palette
- [ ] Its settings are the ones `sandbox.mjs` writes today; `sandbox.mjs` reads them from the profile, so the list lives in one place
- [ ] `node scripts/sandbox.mjs --reset` opens with the same activity bar (checked by hand once; the screenshot or a sentence goes in the Progress section)
- [ ] A `node --test` test in `vsslicer/scripts/test/` checks that the profile parses, that its `globalState` unpins the three containers and hides Accounts, and that the sandbox writes those keys
- [ ] The VSSlicer containers (Projects, Printers, Filaments, Profiles) are not listed in the profile, so they keep their default pinned state as apps add them

## Tasks

- [ ] Verify the `state.vscdb` route on a scratch user-data dir
- [ ] Write the profile and move the settings into it
- [ ] Make `sandbox.mjs` apply it; test

## Progress

Not started.
