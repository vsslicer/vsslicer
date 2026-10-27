---
id: 204
title: Group modules by Clean layer and split develop/main
priority: P0
effort: M
model: opus
sprint: "VSS:SP13"
created: 2026-10-27
---

Owner request (2026-10-27): the flat `vsslicer/modules/` is too big; group it, and run per-card commits on `develop` with sprint merges and tags on `main`.

Package: `vsslicer/scripts` (runner), every module folder, `.github/workflows/ci.yml`, `.ai/instructions.md`, sprint-cycle skill. Layer: tooling.

- Folders: `common/` (contracts), `core/` (engines), `printer/`, `profiles/`, `slicer/`, `camera/`, `filament/` (adapter families), `ui/`, `apps/` (VS Code extensions), `tooling/`. Folder drops the group prefix; package names unchanged.
- History rewritten so every commit uses the grouped paths (backup: branch `backup/pre-regroup`, `.ai/local/backup-pre-regroup.bundle`).
- `main` = one `--no-ff` merge per closed sprint, tagged `sprint/SP<n>`; `milestone/R1`, `milestone/R2` tagged. `develop` = per-card commits.
- Runner discovers `modules/<group>/<module>`; release tags use the package short name.
- Open cards, epics, plans and skills rewritten to the new paths (planned modules mapped too); done/archived history unchanged.

Done when: `node scripts/run.mjs checks` passes, runner tests pass (except the pre-existing large-fixtures CI test), `node scripts/run.mjs ci` passes.