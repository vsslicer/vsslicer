# Provenance

All code in this module is original work written for VSSlicer; nothing is copied or adapted from other projects. Licence: AGPL-3.0-or-later (see `LICENSE`). It bundles `@vsslicer/gcode-api`, `gcode-parser`, `gcode-bgcode` (a libbgcode port, AGPL-3.0), `gcode-planner` (Klipper and PrusaSlicer/Marlin ports, AGPL-3.0) and `webview-kit`.

Test fixtures in `test/fixtures/` are copies of the gcode-parser corpus; each folder's `PROVENANCE.md` names the generator, version, settings and licence.

The bundled `webview-kit` also contains a port of OrcaSlicer libvgcode (AGPL-3.0, Prusa Research and OrcaSlicer contributors) in its `gl` entry. gcode-preview 0.2.0 bundles only the `webview` and `host` entries (checked in `dist/webview.meta.json`), so none of that port ships in it yet. Update this note when the renderer imports `@vsslicer/webview-kit/gl`.
