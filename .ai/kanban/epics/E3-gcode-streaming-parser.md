---
id: E3
title: Build the @vsslicer/gcode streaming parser
status: reviewed
initiative: I1
project: GCP
order: 1
depends_on: [E1]
rows: ["§10 Read `.bgcode`", "§10 Read `.gcode.3mf`", "§10 Arc rendering", "§10 Per-job filament use, weight and cost"]
---

`@vsslicer/gcode` reads any sliced file from PrusaSlicer, SuperSlicer, OrcaSlicer, Bambu Studio and
Cura, as text G-code, binary `.bgcode` or a Bambu `.gcode.3mf` plate, and turns it into compact
structure-of-arrays move buffers plus metadata (thumbnails, object labels, config block, the
slicer's summary statistics). It is the data contract that the planners (E4), the preview (E5),
the language features (E6) and other projects (FIL consumption, SLC output checks) build on. It
runs in a Node worker thread, streamed from disk, so a 500 MB file never enters the extension
host's heap or a `TextDocument`.

## Scope

In:
- Streaming text parser: G0/G1/G2/G3, G90/G91, M82/M83, G92, G10/G11 firmware retraction, G17-19
  planes, tool changes, M104/M109/M140/M190, M106/M107, M204/M205/M201/M203/M566, M900/M572,
  `SET_VELOCITY_LIMIT`, `SET_PRESSURE_ADVANCE`. Unknown commands are kept as named markers.
- Both slicer tag sets: the Prusa-compatible set (`;TYPE:`, `;LAYER_CHANGE`, `;Z:`, `;HEIGHT:`,
  `;WIDTH:`) and the BBL set (`; FEATURE:`, `; CHANGE_LAYER`, `; Z_HEIGHT:`, `; LINE_WIDTH:`),
  plus Cura's `;TYPE:`/`;LAYER:`/`;MESH:`. Slicer and flavour detection from header lines.
- `.bgcode` reader: file header, six block types, compression none/Deflate/Heatshrink 11-4 and
  12-4, MeatPack with and without comments, CRC32, the undocumented JSON "Slicer3" metadata
  block. **Ported** from libbgcode@d4da907 (AGPL-3.0) `src/LibBGCode/core` and the decoders in
  `binarize/` to TypeScript, with original notices and a per-file provenance line. Inflate uses
  `node:zlib` behind a small codec interface so a later web build can use `DecompressionStream`.
- `.gcode.3mf`: read-only zip entry reader (central directory, raw inflate) for
  `Metadata/plate_N.gcode`, `plate_N.gcode.md5`, `slice_info.config`, `plate_N.png`; plate
  selection. Written new; E8's OPC container may replace it later.
- Arc tessellation for drawing: G2/G3 in I/J and R form, chord-tolerance tessellation into the
  move buffer, each segment flagged with its source arc. The R-form centre and the discretisation
  rule are **ported** from PrusaSlicer@30ef591 libpgcode `ProcessorImpl.cpp:929-975, 1120-1206`
  (AGPL-3.0). Timing segmentation per firmware is E4's.
- Thumbnails (PNG, JPG, QOI blocks, Prusa comment form, Orca's extra formats skipped with a
  marker), object labels in all three forms (`; printing object`, M486, `EXCLUDE_OBJECT_*`) plus
  Cura `;MESH:`, the config block (key-value map), and summary statistics: filament length,
  volume, weight, cost and the slicer's own time estimate, per extruder.
- Move buffer layout, about 28 bytes per move: f32x3 position, f16 width and height, u8 role,
  tool and flags, u32 file offset, f32 start time (filled by E4). Layer index table. Diagnostics
  with file offsets. Transferable `ArrayBuffer`s.
- Worker host: `worker_threads` wrapper with cancel, progress and a memory cap.
- Tag tables **ported** from PrusaSlicer@30ef591 libpgcode `Types.hpp:308-319` and
  OrcaSlicer@09aa0114 `GCodeProcessor.cpp:100-150` (AGPL-3.0), with provenance lines.

Out: time and speeds (E4), rendering (E5), writing `.bgcode` (SLC §7 Binary G-code output),
G5 Bézier moves (no slicer emits them; shown as markers), Bambu private M-code semantics (markers
only), level-of-detail merging (E5 spike if needed).

## Feature-matrix rows

- **§10 Read `.bgcode` (P0).** Done when every PrusaSlicer `.bgcode` fixture decodes to the same
  G-code lines as its `.gcode` twin and all metadata blocks are exposed.
- **§10 Read `.gcode.3mf` (P0).** Done when Bambu Studio and Orca BBL plate files open by plate,
  with `slice_info.config` statistics and plate thumbnails, and an MD5 mismatch is reported.
- **§10 Arc rendering (P0).** Done when arc-fitted fixtures from PrusaSlicer and Orca tessellate
  within 0.05 mm chord tolerance and the R form resolves to the same centre as I/J.
- **§10 Per-job filament use, weight and cost (P0).** Done when the summary of every fixture
  matches the slicer's own summary comments (or `slice_info.config`) per extruder.

## Acceptance criteria

- [ ] Golden corpus checked in (small files, generating slicer and version recorded): calibration
      cube and a multi-material sample from PrusaSlicer, SuperSlicer, Orca, Bambu Studio and
      Cura, arc fitting on and off where the slicer has it; golden JSON per file (move count,
      layer count, role histogram, labels, thumbnails, summary) compared in vitest
- [ ] `.bgcode` twins: decoded G-code equals the `.gcode` twin line for line; CRC failure,
      unknown block type, unknown compression and truncated block each raise a typed diagnostic
- [ ] Heatshrink and MeatPack decoders tested on vectors produced by the libbgcode code paths
      in the fixtures; a corrupted stream fails with a diagnostic, never a hang
- [ ] Arc tests: I/J and R forms, full circles, negative R, planes G18/G19, inconsistent radius
      (diagnostic, falls back to a straight move)
- [ ] Memory budget: synthetic 50, 200 and 500 MB files parse in a worker with move buffers at
      or under 28 bytes per move and peak worker RSS recorded in CI
- [ ] Throughput recorded per file size; moves-per-byte spike result recorded as a decision
- [ ] A file with no slicer tags still parses (roles `unknown`, a diagnostic says why)
- [ ] Verified only on fixtures; nothing in this epic needs the H2C, but one `.gcode.3mf` sliced
      for the H2C in Bambu Studio is in the corpus (Bambu Studio version recorded)

## Dependencies

- Needs E1 (monorepo, vitest, CI, fixture storage).
- Exposes `parse(source, opts) -> AsyncIterable<Chunk>` and a `ParsedFile` (move buffers, layer
  table, labels, thumbnails, config, summary, diagnostics) to E4, E5, E6, E7.
- Exposes `readSummary(uri)` (statistics without moves) for E42 consumption booking and
  E27 output checks; E10 reads plate thumbnails through it.

## Risks and spikes

- Moves per byte with arc fitting is unknown (report open question): spike on the corpus before
  freezing the layout; if it exceeds the budget, add the far-zoom merge to E5.
- Bambu `.gcode.3mf` from current Bambu Studio may use zip features the minimal reader lacks
  (data descriptors, zip64): test on the H2C file early.
- Prusa Buddy metadata and BBL header blocks change between slicer releases: golden files pin
  versions; a new slicer release adds fixtures, not code paths, unless a tag changed.

## Eng review

- Scope: this is the smallest epic that delivers its rows; thumbnails, labels and summary share
  the same pass, so splitting them would mean a second parse. `.bgcode` could be a separate
  epic but is about one sprint; kept here. Estimate 4 sprints.
- Arc rendering was moved here from E5: tessellation happens once in the parser, so the renderer
  draws only straight segments and the row's oracle (tolerance vs slicer) is a unit test.
- Blast radius: a parser crash or out-of-memory error stays in the worker; the host receives a
  typed error. Never parse on the host thread.
- Zero silent failures: every error class (bad magic, CRC, codec, truncated, zip, MD5, arc
  radius, memory cap) has a diagnostic with a file offset and a test; E5 shows them.
- Reversibility: the codec interface and the platform-neutral core keep a web build possible.

## Coordinator reconciliation

- Owns the moves-per-byte spike. Reads `.gcode.3mf` through the VWR container layer, which ships first; fallback is fflate directly with a migration later.
