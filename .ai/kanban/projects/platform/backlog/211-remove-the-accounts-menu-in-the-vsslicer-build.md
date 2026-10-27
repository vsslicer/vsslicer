---
id: 211
title: Remove the Accounts menu in the VSSlicer build
type: feature
priority: P1
effort: S
model: opus
area: [fork]
story: US71
milestone: "VSS:M6"
depends_on: [149]
created: 2026-10-27
---

D23 step 2: the build has no Accounts entry, not just a hidden one. Prefer a `product.json` or configuration default over a source patch; a patch only if neither works, and then the smallest one, recorded for the rebase rehearsal (PLT-169).

**Code:** `vsslicer/modules/tooling/vsslicer-build/build/` (overlay and patches) (module: `vsslicer-build`, layer: `n/a (build)`)

## Acceptance criteria

- [ ] The built editor shows no Accounts icon in the activity bar and no Accounts item in any menu, on a fresh user-data dir
- [ ] The way it's done (product.json key, default setting or patch) is written in the card with the VS Code source lines it relies on, `repo@commit:path:line`
- [ ] The smoke test (PLT-160) checks the Accounts entry is absent

## Tasks

- [ ] Find the least-invasive switch in the pinned VSCodium/VS Code sources
- [ ] Apply it and extend the smoke test

## Progress

Not started.
