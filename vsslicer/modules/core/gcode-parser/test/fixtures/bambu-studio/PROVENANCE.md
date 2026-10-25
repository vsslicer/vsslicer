# Provenance: bambu-studio

Generated on 2026-10-25 by `scripts/slice-fixtures.sh` (module root) with the installed Bambu Studio 02.08.02.61 (`/Applications/BambuStudio.app`, CLI `--slice 0`). Inputs are STL models written by `scripts/make-model.mjs` (20 mm cube, 20 mm x 10 mm cylinder; not committed).

- Profiles: the app's bundled BBL `Bambu Lab X1 Carbon 0.4 nozzle`, `0.20mm Standard @BBL X1C`, `Bambu PLA Basic @BBL X1C`. `cylinder-arcs-on` / `-off` set `enable_arc_fitting` to 1 / 0 in a copy of the process profile; the cube keeps the profile default (0).
- Gaps: the H2C `.gcode.3mf` and a two-material sample could not be produced with this CLI version; see `../manifest.json` (`pending`).
- Licence: generated output of the above (profiles are Bambu Studio's, AGPL-3.0). Files are used under AGPL-3.0-or-later with the rest of the repository (D2).
