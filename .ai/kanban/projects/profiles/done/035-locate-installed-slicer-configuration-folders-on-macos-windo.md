---
id: 35
title: "Locate installed slicer configuration folders on macOS, Windows and Linux"
type: feature
priority: P0
effort: S
model: sonnet
area: [importers]
story: US16
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [135, 118]
created: 2026-10-25
---

`locateInstalledSlicers()` returns the PrusaSlicer, SuperSlicer, Orca, Bambu Studio and Cura config folders that exist, per OS.

**Code:** `vsslicer/modules/profiles/src/adapters/locate/` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [x] Table-driven tests over a fake file system for each OS layout (including Flatpak/Snap paths for Linux) return the expected folders
- [x] A missing or unreadable folder is reported with a diagnostic, not thrown

## Tasks

- [x] Write the OS path tables
- [x] Write the tests

## Progress

Not started.

PRF-35-worker: done. `src/adapters/locate/locate.ts` (`locateInstalledSlicers`, never throws, diagnostics missing/unreadable/truncated, Cura versions capped at 64 entries, newest first), port `src/application/file-system-port.ts` (`DirectoryLister`), tests `test/adapters/locate.test.ts` (11 tests module-wide pass; lint, build, checks pass). Caveat: docs/research/profiles.md has no config-folder section, so Flatpak ids / Snap names / Cura paths are from upstream listings and unverified (commented in code).
index.ts lines: `export * from './adapters/locate/locate.ts';` and `export type { DirectoryLister } from './application/file-system-port.ts';`
CHANGELOG Unreleased: Added `locateInstalledSlicers` for PrusaSlicer, SuperSlicer, Orca, Bambu Studio and Cura config folders on macOS, Windows and Linux (Flatpak/Snap).

Review (sp8-reviewer-1, 2026-10-26 07:45): FAIL
Checked against `.reference/repos` (read only).
Confirmed:
- PrusaSlicer 2.9 native: `<root>/PrusaSlicer` with root = macOS Application Support (PrusaSlicer-2.9@b028299:src/libslic3r/MacUtils.mm:8), Windows CSIDL_APPDATA (src/libslic3r/Utils/DirectoriesUtils.cpp:21), Linux `XDG_CONFIG_HOME` or `~/.config` (DirectoriesUtils.cpp:90-118). Flatpak id `com.prusa3d.PrusaSlicer` (PrusaSlicer@30ef591:README.md:13, Flathub link; CMakeLists.txt:101).
- SuperSlicer: app key `SuperSlicer` (SuperSlicer@1f3d287:version.inc:7), wx GetUserDataDir on macOS/Windows and XDG on Linux (src/slic3r/GUI/GUI_App.cpp:1210,1242-1248).
- OrcaSlicer native: `OrcaSlicer` (OrcaSlicer@09aa0114:version.inc:5; src/slic3r/GUI/GUI_App.cpp:2721,2749-2762).
- Bambu Studio native: `BambuStudio` (BambuStudio@79df7ae:version.inc:5; src/slic3r/GUI/GUI_App.cpp:2628,2640-2646).
- Cura config root: `%APPDATA%`, `~/Library/Application Support`, `XDG_CONFIG_HOME` or `~/.config`, then `cura/<major.minor>` (Uranium@e65ccc1:UM/Resources.py:407-422,488-493; Cura@5bea2f8:cura/ApplicationMetadata.py:7).
Unverified (no upstream source in the clones): Flatpak ids `com.github.supermerill.SuperSlicer`, `com.bambulab.BambuStudio`, `com.ultimaker.cura`; Snap names `prusa-slicer`, `cura-slicer` (PrusaSlicer README says Linux is Flathub only, so the snap is unofficial).
Findings:
1. `src/adapters/locate/locate.ts:47`: Orca's Flatpak id is now `com.orcaslicer.OrcaSlicer` (OrcaSlicer@09aa0114:scripts/flatpak/com.orcaslicer.OrcaSlicer.yml:1); `io.github.softfever.OrcaSlicer` is the legacy id, which Orca migrates from (src/slic3r/GUI/GUI_App.cpp:589-604). Upstream contradicts the single id. Fix: try both ids (current first) and add a test row for the new one.
2. `src/adapters/locate/locate.ts:62-77` (Cura on Linux): Uranium keeps only preferences (`cura.cfg`) under the config root; every profile type (machine_instances, quality_changes, materials, user, extruders, ...) goes to `XDG_DATA_HOME` or `~/.local/share` + `cura/<ver>` (Uranium@e65ccc1:UM/Resources.py:186-193,452-462,496-501; Cura@5bea2f8:cura/CuraApplication.py:461-470). An importer pointed at `~/.config/cura/5.7` finds no profiles. Fix: on Linux, report the data folder for Cura (native `XDG_DATA_HOME`/`~/.local/share/cura`, Flatpak `~/.var/app/<id>/data/cura`, Snap `~/snap/<n>/current/.local/share/cura`), or both folders, and say which one in the result; add a test.
3. `src/adapters/locate/locate.ts:37-42`: PrusaSlicer 3 changes the folder name to `PrusaSlicer<major>`, with `-dev` for alpha/beta, so `PrusaSlicer3` / `PrusaSlicer3-dev` (PrusaSlicer@30ef591:src/slic3r-base/src/Slic3r/Directories.cpp:221-233; version.inc:6 is 3.0.0-alpha12). Not yet released, but the locator will miss it. Fix: add `PrusaSlicer3` (and optionally `PrusaSlicer3-dev`) candidates, or record the gap in the code comment.
4. `src/adapters/locate/locate.ts:43`: the comment cites `docs/research/profiles.md`, which has no such section, and calls all ids unverified. Fix: replace it with the confirmed/unverified split above, with the sources.
Not findings: layers and imports are fine (adapter uses a port from application, `node:path` only); the Cura entry cap bounds work (100k entries probe in the worker's test); a missing or unreadable folder becomes a diagnostic. package.json / lockfile changes in `profiles` belong to PRF-70's `@vsslicer/profile-api` dependency, not reviewed here.
Ran: profiles `pnpm test` (18 pass), `pnpm lint`, `pnpm build`; `node scripts/run.mjs checks` from `vsslicer/` (pass).

Review (sp8-reviewer-8, 2026-10-26 07:52): PASS (re-review after fix round 1)
All four findings of sp8-reviewer-1 fixed, checked against `.reference/repos` (read only):
1. Orca Flatpak: `locate.ts:65` tries `com.orcaslicer.OrcaSlicer` then `io.github.softfever.OrcaSlicer`; confirmed OrcaSlicer@09aa0114:scripts/flatpak/com.orcaslicer.OrcaSlicer.yml:1 (`app-id`) and src/slic3r/GUI/GUI_App.cpp:589-604 (legacy id migration). Test rows for both ids.
2. Cura Linux: `locate.ts:90-105` adds `kind: 'data'` folders (native XDG_DATA_HOME or `~/.local/share/cura`, Flatpak `.../data/cura`, Snap `.../.local/share/cura`); confirmed Uranium@e65ccc1:UM/Resources.py:186-193 (only Preferences in config), 452-462, 496-501, Cura@5bea2f8:cura/CuraApplication.py:461-470. Tests cover XDG_DATA_HOME and the config+data kinds.
3. PrusaSlicer3 / PrusaSlicer3-dev candidates added; confirmed PrusaSlicer@30ef591:src/slic3r-base/src/Slic3r/Directories.cpp:221-233 and version.inc:6 (3.0.0-alpha12).
4. Comment `locate.ts:40-53`: confirmed/unverified split matches the sources above; the unverified list (SuperSlicer/Bambu/Cura Flatpak ids, Snap names) is accurate.
No regressions: non-Cura paths unchanged, Cura entry cap still applies per candidate, missing/unreadable still diagnostics.
Ran: profiles `pnpm test` (23 pass), `pnpm lint`, `pnpm build`; `node scripts/run.mjs checks` (exit 0).
