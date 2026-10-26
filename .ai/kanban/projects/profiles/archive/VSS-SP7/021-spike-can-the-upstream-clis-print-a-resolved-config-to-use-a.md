---
id: 21
title: "Spike: can the upstream CLIs print a resolved config to use as an oracle"
type: spike
priority: P0
effort: S
model: opus
area: [importers]
story: US19
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-prf-21
depends_on: [1]
created: 2026-10-25
---

Answers whether PrusaSlicer `--export-config`/`--save` and Orca `--export-settings` print a resolved config, so the tuple cards of each adapter module have an oracle. Shared research notes, not part of any module.

**Code:** `vsslicer/fixtures/profile-research/oracle.md` (layer: n/a (spike notes))

## Acceptance criteria

- [x] A written result per CLI: command run, version, whether the output is fully resolved, how to read it; or a statement that none exists
- [x] Decides which oracle each ecosystem's tuple test uses (CLI export, or hand-checked expectations citing `profiles.md` lines)
- [x] Runs the CLIs only on fixture inputs, from a scratch dir, never inside a clone

## Tasks

- [x] Run each CLI on a vendor preset
- [x] Compare with a hand merge
- [x] Write the decision

## Progress

Done (sp7-prf-21, 2026-10-26).

- **What:** ran the installed OrcaSlicer 2.5.0-dev and BambuStudio 02.08.02.61 CLIs with `--load-settings ... --export-settings` on vendor-tree copies (Orca `Voron` and `OrcaFilamentLibrary`, Bambu `BBL`) in a scratch dir, with a scratch `--datadir`/`--outputdir` and `timeout 120`. Compared each export key by key with a hand merge of the inherits/include chain. PrusaSlicer is not installed, so it is covered from source (2.9 and 3.0-alpha12) and marked unverified.
- **Result:**
  - Orca resolves system presets fully. A changed fixture grandparent value showed up in the export. Machine 55 of 57 keys, process 106 of 109 and the filament all match the hand merge; the differences are only normalisation.
  - Bambu does not resolve: keys the preset file does not set come out as defaults (`printable_height` 100, not 250). Its CLI expects pre-flattened `*_full` dirs that are not shipped.
  - Orca's CLI resolves the Bambu tree for the keys it knows.
- **Decision:**
  - Orca: CLI-generated golden files (CI never runs Orca).
  - Bambu: hand-checked expectations citing `profiles.md:94-102`, with the Orca export as an optional cross-check for shared keys.
  - Prusa: hand-checked expectations citing `profiles.md:31-37`; 2.9 `--save` once a PrusaSlicer install is available.
- **Files:** `vsslicer/fixtures/profile-research/oracle.md` (new); notes `.reference/notes/PRF-21-cli-oracle.md`.
- **Verified:** CLI exits 0 for Orca and Bambu, the mutation test, the hand-merge comparison counts above, and `find -newer` on `~/Library/Application Support/{OrcaSlicer,BambuStudio}` (no writes from these runs).
- **Not done:** Orca user presets (`from: User`) via the CLI failed in a scratch datadir and were not pursued. Orca releases older than the installed nightly were not tested. PrusaSlicer is unverified.
- **Shared-file changes:** none (spike, no code).


Review (sp7-rev-spikes): PASS. Checked every source cite in oracle.md against the clones: OrcaSlicer@09aa0114 src/OrcaSlicer.cpp:1405-1424 (stdout guard, start_gui), :2074-2113 (resolve_preset, system -> allow_source_manifest), :3106 (compatible_printers dropped), PrintConfig.cpp:12898-12902, :9841, PresetBundle.cpp:555-668 (manifest lookup :622); BambuStudio@79df7ae src/BambuStudio.cpp:2296-2345 (no inherits follow), :2397/:2816/:2886 (*_full dirs), :6414-6418; PrusaSlicer-2.9@b028299 PrintConfig.cpp:5990-6003/6056-6059/6207 and absent src/PrusaSlicer.cpp; PrusaSlicer@30ef591 Legacy/PrintConfig.cpp, ProcessActions.cpp:660-700, LoadPrintData.cpp:235-250/419-465; profiles.md:31-37, 94-102, 341-346 all say what is cited. Re-ran `OrcaSlicer --help` (timeout 60, scratch cwd, removed after): header OrcaSlicer-2.5.0-dev, flags --datadir/--load-settings/--load-filaments/--outputdir/--export-settings ('Use - to write them to stdout') confirmed. Prusa has no --export-config option (grep, both clones); --save is the right one. Unverified Prusa section is marked so. Decision table follows from the evidence; licence handled (oracle runs do not link; golden files carry the profile-data licence). Notes (no fail): Bambu source read is 02.08.04.57 while the binary run is 02.08.02.61, stated in the report; Orca source (10-25) is newer than the binary (10-06), but the resolver behaviour was confirmed empirically by the mutation test.
