# Provenance: ini

Hand-written, minimal fixtures that mimic the structure of PrusaSlicer INI files. Not copied from upstream.

- `bundle.ini`: modelled on `resources/profiles/PrusaResearch.ini` of PrusaSlicer@b028299 (AGPL-3.0): `[vendor]`, `[printer_model:*]`, `[printer:*]`, `[print:*]`, `[filament:*]`, an abstract `*common*` section, multi-parent `inherits`, comments, one malformed line. Written for this repository, AGPL-3.0-or-later.
- `user-preset.ini`: modelled on a user preset file (header-less `key = value`, CRLF, UTF-8 BOM). The header-less shape is what PrusaSlicer writes; the BOM is not (PrusaSlicer writes none and boost would reject a BOM'd first line), it is a leniency of this reader. Written for this repository, AGPL-3.0-or-later.
- `user/print/My 0.15mm @MK4S.ini`: modelled on a PrusaSlicer 2.9 user print preset, which PrusaSlicer stores header-less under `print/` with `inherits` naming one system preset (`PresetBundle.cpp:1366-1374` of PrusaSlicer@b028299). Written for this repository, AGPL-3.0-or-later.
