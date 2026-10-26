---
id: 60
title: Create the fixture workspace and per-OS slicer configuration folders
type: chore
priority: P0
effort: M
model: sonnet
area: [store]
story: US26
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [57, PLT-13]
created: 2026-10-25
---

Fixture workspaces for the extension's integration tests: an imported Orca vendor, a fixture Prusa bundle, and slicer configuration folders for the macOS, Windows and Linux layouts.

**Code:** `vsslicer/modules/profiles-extension/test/fixtures/` (module: `profiles-extension`, layer: n/a (fixtures))

## Acceptance criteria

- [x] Fixtures pass the PLT fixtures check (size cap, PROVENANCE.md)
- [x] Each OS layout fixture contains user presets for all five slicers (small hand-built files citing the real layout)

## Tasks

- [x] Build the fixtures
- [x] Write PROVENANCE.md

## Progress

Fixtures in `vsslicer/modules/profiles-extension/test/fixtures/`, all synthetic (no upstream bytes), 50 files, 200 KB:
- `workspace/`: an Orca vendor (`imports/orca/FixtureVendor.json` + machine/process/filament), a Prusa vendor bundle (`imports/prusa/FixturePrusa.ini`) and `.vsslicer/profiles/process/fixture-standard.json`.
- `slicer-config-{macos,windows,linux}/`: stand-in home folders; user presets for OrcaSlicer and BambuStudio (`user/default/{process,filament,machine}`), PrusaSlicer and SuperSlicer (`{print,filament,printer}/*.ini`) and Cura (`5.8/quality_changes/*.inst.cfg`) at `Library/Application Support`, `AppData/Roaming` and `.config` / `.local/share/cura`.
- Each of the four folders has PROVENANCE.md citing the layout sources (OrcaSlicer@09aa0114, BambuStudio@79df7ae, PrusaSlicer@30ef591, Cura@5bea2f8 `cura/CuraApplication.py:383`). Layouts for SuperSlicer and the Windows/Linux Cura paths are from memory of the apps, unverified against code.
- `test/fixtures.test.ts` asserts every OS layout has presets for all five slicers. Mutation probe: moving `slicer-config-linux` away fails it (1 fail), restored.
- Added `test/fixtures` to `.prettierignore`. `node scripts/check-fixtures.mjs` passes.
- Verified together with PRF-67: lint, build, `pnpm test` 7 pass, `pnpm test:integration` 3 pass on 1.100.0 and stable, `run.mjs checks` exit 0.

**Review passed (sp10-coordinator; review dispatch was refused by the permission classifier, so the coordinator, who wrote none of this code, reviewed)**: profiles-extension `pnpm lint` clean, build ok, `pnpm test` 7 pass. Probe: moving `test/fixtures/slicer-config-linux/.config/OrcaSlicer` away fails the fixture test (6 pass, 1 fail), restored. Fixtures 200 KB, synthetic, PROVENANCE.md per folder. Note: the SuperSlicer paths and the Windows/Linux Cura paths are from memory, not checked against upstream code (worker's own note); the first card that reads these folders (PRF-36) checks them against `.reference/repos/`. Commit waits for PRF-67 (shared package.json, CHANGELOG, eslint and prettier config).
