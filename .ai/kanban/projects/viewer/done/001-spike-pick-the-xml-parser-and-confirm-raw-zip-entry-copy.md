---
id: 1
title: "Spike: pick the XML parser and confirm raw zip entry copy"
type: spike
priority: P0
effort: S
model: opus
area: [3mf]
story: US2
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [PLT-8]
created: 2026-10-25
---

Chooses the permissively licensed streaming XML parser and settles how a package is saved byte-identically (fflate raw entry copy or a local-header copier of our own). Output decides the container design.

**Code:** notes in `.reference/notes/` and a decision paragraph in `vsslicer/modules/3mf/README.md` (module: `3mf`, layer: n/a (spike))

## Acceptance criteria

- [x] Two or more XML parsers measured on a 100 MB sub-model: licence (permissive only), streaming, speed, browser and Node support; the pick is written down with numbers
- [x] A script shows whether fflate exposes raw compressed entries; if not, a 50-line local-header copier is prototyped and writes a zip whose entries are byte-identical to the input
- [x] Verified on a synthetic zip only (D5)

## Tasks

- [x] Measure candidate XML parsers
- [x] Test fflate raw entry access
- [x] Prototype the copier if needed
- [x] Record the decision

## Progress

Done (vwr1-worker, 2026-10-26). Spike only; no module code. The `3mf` module does not exist yet, so
the README decision paragraph is in `.reference/notes/VWR-1-xml-zip-spike.md` ("Decision paragraph")
for VWR-2 to paste into `vsslicer/modules/3mf/README.md`.

- XML: on a synthetic 105 MB model (1.17 M vertices, 0.87 M triangles, Node 26, one run each):
  saxes 6.0.0 (ISC) streamed 1,157 ms / 79 MB RSS; txml 6.0.3 (MIT) 3,041 ms / 743 MB;
  fast-xml-parser 5.11.2 (MIT) 6,647 ms / 810 MB. All three pure JS (browser + Node); only saxes
  streams. **Pick: saxes.**
- Zip: fflate 0.8.3 (MIT) gives raw compressed bytes on read (`Unzip.register` pass-through decoder
  for method 8) and writes raw data with a custom `ZipInputFile`, but rewrites headers and exposes no
  CRC on read, so entries are not byte-identical. A 32-line local-header copier (fflate only for
  replaced entries) kept every untouched local record byte-identical and reproduced an unchanged
  file exactly, on zips from Python `zipfile` and fflate zipSync. **Pick: fflate + own copier.**
- Verified on synthetic zips only (D5). Scripts: `.reference/notes/VWR-1-spike/`.
- Not done: ZIP64 and archive comments in the copier; inflate-to-saxes pipeline and webview timing.
- VWR-2 should add: `saxes@6.0.0`, `fflate@0.8.3` (exact).
- Files changed: this card, `.reference/notes/VWR-1-xml-zip-spike.md`, `.reference/notes/VWR-1-spike/*`.
- Changelog: none (spike).
- Review passed (vwr1-reviewer): re-ran copier on a fresh Python-made zip (3 MB model, stored+deflated): no-op rewrite byte-identical, kept local records identical, replaced entry correct. Licences from package.json: saxes 6.0.0 ISC, xmlchars 2.2.0 MIT, fflate 0.8.3 MIT. Numbers (1.2 s/79 MB vs 3.0 s/743 MB vs 6.6 s/810 MB, streaming only in saxes) support the pick. Follow-up for VWR-8: copier has no ZIP64 (EOCD64, 0xFFFFFFFF offsets) and drops the archive comment; add fixtures there.
