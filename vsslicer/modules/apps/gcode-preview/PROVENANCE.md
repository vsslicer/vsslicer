# Provenance

All code in this module is original work written for VSSlicer; nothing is copied or adapted from other projects. Licence: AGPL-3.0-or-later (see `LICENSE`). It bundles `@vsslicer/gcode-api`, `gcode-parser`, `gcode-bgcode` (a libbgcode port, AGPL-3.0), `gcode-planner` (Klipper and PrusaSlicer/Marlin ports, AGPL-3.0) and `webview-kit`.

Test fixtures in `test/fixtures/` are copies of the gcode-parser corpus; each folder's `PROVENANCE.md` names the generator, version, settings and licence.

The bundled `webview-kit` also contains a port of OrcaSlicer libvgcode (OrcaSlicer@09aa0114b4e145b89cd61015d8cdf29dbc15b008:src/libvgcode, AGPL-3.0, Prusa Research and OrcaSlicer contributors) in its `gl` entry. Since GCP-31 the webview (`src/presentation/webview/preview-renderer.ts`) imports `@vsslicer/webview-kit/gl`, so `dist/webview.js` ships that port (its files are listed in `dist/webview.meta.json`). The attribution sits in a `/*! ... */` comment in `preview-renderer.ts`, which esbuild keeps as a legal comment at the end of the bundle; the full provenance is in webview-kit's `src/gl/segment-shader.ts`.
