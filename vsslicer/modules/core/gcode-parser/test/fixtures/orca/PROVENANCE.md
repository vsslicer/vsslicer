# Provenance: orca

Generated on 2026-10-25 by `scripts/slice-fixtures.sh` (module root) with the installed OrcaSlicer 2.5.0-dev (`/Applications/OrcaSlicer.app`, CLI `--slice 0`). Inputs are STL models written by `scripts/make-model.mjs` (20 mm cube, two 10 mm cubes, 20 mm x 10 mm cylinder; not committed).

- Profiles: JSON read as data from the cloned OrcaSlicer repository at commit `09aa0114b4e145b89cd61015d8cdf29dbc15b008` (`resources/profiles`, version 2.5.0-dev, the same as the installed app), flattened by `scripts/flatten-profile.mjs`. The installed app's own profile bundle is packed, so it cannot be used from the CLI.
  - `cube-marlin`: Custom `MyMarlin 0.4 nozzle`, `0.20mm Standard @MyMarlin`, `Generic PLA @System`; `layer_change_gcode` set to `G92 E0` (the profile uses relative extrusion).
  - `*-x1c`: BBL `Bambu Lab X1 Carbon 0.4 nozzle`, `0.20mm Standard @BBL X1C`, `Bambu PLA Basic @BBL X1C`. `two-material-x1c` uses that filament twice (red and blue), one cube per filament, with the prime tower; the cylinders set `enable_arc_fitting` to 1 or 0.
- Settings: other values are the profiles' defaults (0.2 mm layers).
- Licence: generated output of the above; the profiles are AGPL-3.0 (OrcaSlicer). Files are used under AGPL-3.0-or-later with the rest of the repository (D2).
