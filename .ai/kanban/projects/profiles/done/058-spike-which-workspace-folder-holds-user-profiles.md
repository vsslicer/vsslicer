---
id: 58
title: "Spike: which workspace folder holds user profiles"
type: spike
priority: P1
effort: S
model: opus
area: [store]
story: US25
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [57]
created: 2026-10-25
---

Checks how VS Code orders `workspaceFolders` and settles the rule (first folder with `.vsslicer/`, else the first folder).

**Code:** `vsslicer/modules/profiles-extension/docs/multi-root.md` (module: `profiles-extension`, layer: n/a (spike notes))

## Acceptance criteria

- [x] A test-electron run with a 3-folder workspace records the folder order and the chosen rule
- [x] The README limitation for remote and web hosts (installed-slicer detection is local only) is drafted

## Tasks

- [x] Run the experiment
- [x] Write the rule and limitation text

## Progress

Not started.

2026-10-26, sp12-prf-58 (macOS arm64; the module CI gate runs on Linux, this spike adds no code or tests):

- Rule and evidence: `vsslicer/modules/profiles-extension/docs/multi-root.md`. Raw notes and probe sources:
  `.reference/notes/PRF-58-workspace-folder-for-user-profiles.md`. Upstream: microsoft/vscode @ 4ef6bab7 (MIT).
- Rule: first `workspaceFolders` entry containing `.vsslicer/`, else `workspaceFolders[0]`; none open: no user store.
  `workspaceFolders` keeps the `.code-workspace` file order, drops duplicates, no sorting
  (`vscode@4ef6bab7:src/vs/platform/workspaces/common/workspaces.ts:198-235`).
- Criterion 1: test-electron 3.1.0 run (scratch probe extension, driven directly because `@vsslicer/test-vscode`
  opens no workspace) on VS Code 1.100.0 and 1.143.1, workspace listing `zeta, alpha, mid, ./zeta`. With
  `.vsslicer/profiles/` in alpha and mid: order `0:zeta 1:alpha 2:mid`, chosen `alpha`, `workspaceContains` activated.
  With none: same order, chosen `zeta`, not activated. Duplicate dropped. Both versions identical. Probe: the file order
  is deliberately non-alphabetical and the `.vsslicer/` folder is not first, so a sorted order or a "first folder" rule
  would have recorded a different result (ws1 would choose `zeta`); the no-`.vsslicer/` workspace exercises the fallback.
- Criterion 2: README limitation drafted in `docs/multi-root.md` ("README limitation (draft)"), sourced from the
  VS Code remote and web extension docs; marked unverified on real remote/web hosts (none run). Probe: n/a (text).
- Verification: profiles-extension `pnpm install`, `pnpm lint` (pass), `pnpm build` (pass), `pnpm test` 8/8 pass.
  `node scripts/run.mjs checks` fails only in `modules/3mf/src/adapters/bambu/readPlates.ts:15` (check-licence,
  ported-copyright): another card's in-progress 3mf work, not touched here.
- For the coordinator: a `workspace` option in `@vsslicer/test-vscode` (platform card) would let the integration suite
  pin this rule and the PRF-57 review gap (b) (`workspaceContains` activation, shown working by this probe).

Release lines:

- README (profiles-extension), new "Limitations" section: the blockquote under "README limitation (draft)" in
  `docs/multi-root.md`, plus "Multi-root workspaces: user profiles go to the first folder containing `.vsslicer/`, else
  the first folder (see docs/multi-root.md)."
- CHANGELOG: "Document the multi-root rule for the user-profile folder and the remote/web limitation (PRF-58)."

**Review passed (sp12-rev-prf-58)**, 2026-10-26, macOS arm64:

- Ran: profiles-extension `pnpm install`, `pnpm lint`, `pnpm build` (all exit 0), `pnpm test` 8/8 pass;
  `node scripts/run.mjs checks` exit 0 (the 3mf check-licence failure in the card is gone).
- Upstream citations checked in `.reference/repos/vscode` @ 4ef6bab7: `workspaces.ts:198-235` (file order, dedupe by
  comparison key, `index: result.length`, no sort), `workspaceContains.ts:71-80` (any folder activates),
  `vscode.d.ts:13875-13881` (first-folder change restarts the host). All match the doc.
- Manifest claims checked: `extensionKind: ["workspace"]`, no `browser` entry (so no web build), `jsonValidation`
  globs `**/.vsslicer/profiles/<kind>/**/*.json`, activation `workspaceContains:.vsslicer/profiles/`.
- Criterion 1, independent re-run (own scratch extension, test-electron 3.1.0, VS Code 1.100.0 downloaded fresh):
  ws1 `0:zeta 1:alpha* 2:mid*` chosen `alpha` active; ws2 `0:zeta 1:alpha 2:mid` chosen `zeta` not active (both
  identical to the card). Extra probe ws3 `mid, alpha, zeta, mid/` with `.vsslicer/` only in the last folder:
  `0:mid 1:alpha 2:zeta*` chosen `zeta`, activated, trailing-slash duplicate dropped. A "first folder" rule would
  have chosen `zeta`/`mid` in ws1/ws3 and a sorted order would have put `alpha` first, so the recorded result
  discriminates the rule.
- Criterion 2: README limitation text present and sourced (two VS Code docs URLs), marked unverified on real
  remote/web hosts. Probe: n/a (text); claims match the manifest.
- No code, tests or layering changes in this card; licence: VS Code is MIT, nothing ported.
