---
id: E7
title: Expose the preview API and live print follow
status: reviewed
initiative: I1
project: GCP
order: 5
depends_on: [E5]
rows: ["§10 Live print follow (file position from the printer)"]
---

The contract other VSSlicer extensions use to show sliced output and follow a running print:
`GcodePreview.open(uri, {plate?})` and `follow(uri, position)`. The viewer (E10) hands a plate
to the preview, the slicer (SLC) opens what it just produced, and the printers project (PRN)
pushes the printer's progress so the preview shows the toolhead where the printer is. I1 ships
and freezes the API, tested against recorded progress feeds; the live feed itself arrives with
the printer adapters in I4.

## Scope

In:
- `vsslicer.gcode` `exports`: `GcodePreview.open(uri, {plate?, reveal?})`,
  `follow(uri, position) -> Disposable`, `stopFollow(uri)`, with versioned types published in
  `@vsslicer/gcode`. The same operations as commands (`vsslicer.gcode.open`,
  `vsslicer.gcode.follow`, `vsslicer.gcode.stopFollow`) with serialisable arguments, because
  workspace-kind `vsslicer.gcode` and ui-kind `vsslicer.printers` run in different extension
  hosts under Remote-SSH and WSL, where only commands cross.
- Position: `{fileOffset}` (Moonraker `virtual_sdcard.file_position`, OctoPrint, PrusaLink)
  mapped by binary search over E3's file offsets, as Fluidd and Mainsail do; and
  `{layer, percent?}` for printers that report no offset (Bambu, unverified field names).
- Follow mode in E5's editor: the view tracks the printed position, the part above it is
  dimmed, the user can break out and rejoin; a stale feed (no update for a set time) and a file
  mismatch (size or MD5 differs from the printer's file) stop follow with a message.
- Written new; no upstream code.

Out: talking to printers (E20 to E23 call `follow`), the "follow this print" command and
printer picker (PRN), camera overlay (I7), time-remaining prediction from live progress (later,
on E4's timing).

## Feature-matrix rows

- **§10 Live print follow (P1).** Done in I1 when a recorded Moonraker feed and a recorded or
  synthetic Bambu-style layer/percent feed drive the preview through the command API in an
  integration test. Done for users when PRN's adapters call it (I4).

## Acceptance criteria

- [ ] `@vscode/test-electron` test: a stub extension calls the `exports` and, separately, the
      commands; both open the plate and follow a recorded Moonraker `file_position` feed
- [ ] Offset mapping unit tests: offsets inside a line, on a layer boundary, past the end
      (clamped with a warning), in a `.bgcode` file (offsets into the decoded stream vs the
      printer's byte offset into the binary file, whichever the printer reports; documented)
- [ ] Layer/percent mapping tests on the `.gcode.3mf` corpus
- [ ] Stale-feed and mismatched-file tests show the stop-follow message
- [ ] API types are semver-checked in CI (api-extractor report); a breaking change fails without
      a major version bump
- [ ] H2C: one live follow over the E21 feed once it exists, firmware version recorded; in I1
      fixtures only

## Dependencies

- Needs E5 (`PreviewSession.reveal`, plate picker), E3 (file offsets, layer table).
- Exposes the API above to E10 (preview hand-off), E27 (open sliced output), E20 and
  E21/E23 (progress feed). None of them is needed to build or test this epic.

## Risks and spikes

- Bambu reports layer and percent, not a byte offset (from memory of ha-bambulab, unverified):
  spike with PRN on a recorded H2C `push_status` capture to confirm the fields before freezing
  the position type.
- Prusa printers playing `.bgcode` may report offsets into the binary file: spike on PrusaLink
  documentation and a recorded feed; map binary offsets through E3's block index if so.

## Eng review

- Scope: small (1 to 2 sprints). Merging into E5 was considered; kept separate because this is
  the cross-project contract, which needs its own freeze, semver check and tests, and three other
  projects name `E7` in their dependencies.
- Changed after review: commands added next to `exports` (cross-host calls), and the position
  widened from a bare offset to offset or layer/percent (Bambu is the only hardware, D5).
- Dependencies are one-way: `vsslicer.gcode` never imports the printer API; printers push.
- Zero silent failures: stale feed, mismatch, out-of-range position each have a message and a
  test.

## Coordinator reconciliation

- Expose `open`, `follow` and `stopFollow` as commands as well as `exports`, because ui-kind extensions (PRN) run in a different extension host under Remote-SSH and WSL.
