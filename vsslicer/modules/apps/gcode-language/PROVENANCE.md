# Provenance

The grammar and language configuration are original work written for VSSlicer; no grammar is copied or adapted from other projects. The slicer fixtures below are excerpts of generated G-code, licensed as the gcode-parser corpus (AGPL-3.0 slicer profiles; see its per-folder PROVENANCE.md) and used under AGPL-3.0-or-later. Licence: AGPL-3.0-or-later (see `LICENSE`).

Test fixtures in `test/fixtures/`:

- `prusaslicer.gcode`, `orca.gcode`, `bambu-studio.gcode`, `cura.gcode`, `superslicer.gcode`: excerpts (first lines, first commands, and a block of moves) of the gcode-parser corpus, in `vsslicer/modules/gcode-parser/test/fixtures/`: `prusaslicer/mini_cube_ps2.8.1.gcode`, `orca/cube-marlin.gcode`, `bambu-studio/cube.gcode`, `cura/cube-cylinder-4.10.0.gcode`, `superslicer/superslicer-2.3.56-arcwelder.gcode`. Each folder's `PROVENANCE.md` there names the generator, version, settings and licence.
- `tail-config.gcode`: hand-written for this module (GCP-100): a flavour and printer model only in the config block at the end; the test pads the middle.
- `klipper.cfg.gcode`, `rrf.cfg.gcode`: hand-written for this module.
- `corpus/<folder>--<file>.gcode`: one excerpt per `.gcode` file of the gcode-parser corpus (same licence as above): the
  `;FLAVOR:`, `; gcode_flavor =` and `; printer_model =` lines from the file's first 64 KiB, then (GCP-100) those lines from its last 64 KiB when the head lacks them, then the first line of each
  distinct G, M or T code, in file order. The tail lines come after the commands, as in the real files. Enough to detect the flavour and to list every command the file uses.
