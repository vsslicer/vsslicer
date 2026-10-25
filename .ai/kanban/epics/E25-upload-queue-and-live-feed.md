---
id: E25
title: Upload in the background and feed live print position to the preview
status: reviewed
initiative: I4
project: PRN
order: 6
depends_on: [E22, E23, E24, E38]
rows: ["§15 Background upload queue"]
---

Delivers a background upload queue in the agent (uploads continue while the user works and across
window reloads, with progress, cancel and retry) and the live print feed: the printer's current file
and byte offset, published so the G-code preview can follow a running print (E38 owns the follow
view and the §10 row). It is for anyone sending large files over slow links and anyone watching a
print in VS Code.

## Scope

In:
- Upload queue in `vsslicer-agent`: FIFO per printer, parallel across printers, items
  `{id, file, printer, dest, startAfter, state, progress, error}` with states `queued, uploading,
  done, failed, cancelled`; persisted in the agent's state file so a restart resumes or marks
  failed; retry with backoff for `unreachable` and `timeout`, no retry for `auth` or `fileRejected`.
- UI in `vsslicer.printers`: an Uploads view (progress, cancel, retry, open target), status-bar
  item, `withProgress` notifications; `PrinterRegistry.upload` returns a queue item handle.
- Live feed: `PrinterRegistry.follow(printerId)` emits `{fileName, fileUri?, byteOffset, layer?,
  progress, state}`; sources per adapter: Moonraker `virtual_sdcard.file_position`, OctoPrint
  `progress.filepos`, PrusaLink and Duet progress (offset where the API exposes it, else percent),
  Bambu `mc_print_line_number`/percent. The feed maps the printer's file to a local URI when the file
  was sent from this machine (upload record) or is downloadable via `printer://`.
- "Follow in preview" command that calls E38 `GcodePreview.follow(uri, offset)`.

Out: fleet queue across printers and compatibility checks (E47), history records (E46),
the follow rendering itself (E38).

## Feature-matrix rows

- §15 Background upload queue (P1): done when three queued uploads to two fixture printers complete
  in the background with visible progress, one cancelled and one failed and retried, and the queue
  survives a window reload.
- §10 Live print follow is GCP's row (E38); this epic only supplies the feed.

## Acceptance criteria

- [ ] Queue state-machine unit tests: every transition, illegal transitions rejected, persistence
      round trip, restart while `uploading` gives `failed` with "interrupted" or a resume where the
      adapter supports it
- [ ] Integration test with the fake adapter: progress events reach two windows; cancel aborts the
      stream (fake server sees the connection closed)
- [ ] Retry policy test: `unreachable` retries with backoff up to the limit; `auth` fails at once
      with a "fix credentials" action
- [ ] Live feed contract tests per adapter from recorded status fixtures: offsets monotonic during a
      print, reset on new job, null when unknown
- [ ] End to end with E38: a recorded Moonraker print fixture drives the preview's follow
      cursor to the expected move (offset to move by binary search, `gcode-viewer-simulation.md` §7)
- [ ] On the H2C (firmware recorded): queued send of a `.gcode.3mf` while the window reloads; follow
      during the print with the precision the printer reports (line number or percent) recorded
- Other families on fixtures only (D5).

## Dependencies

- Needs E22 (agent), E23 and E21 (adapters), E24 (folder/drive targets and `printer://`
  downloads), E38 (`GcodePreview.follow`).
- Exposes queue item handles to SLC ("slice and send"), E46 (history records created on upload
  done and job start), E47 (dispatch uses this queue for the transfer step).

## Risks and spikes

- Bambu offset precision: `mc_print_line_number` may not map to a byte offset of the G-code inside
  the `.gcode.3mf`; spike on the H2C (half a day) decides whether follow is by line number (E38 can
  index lines) or percent only.
- Files not sent from this machine have no local copy: follow downloads via `printer://` with a size
  prompt or degrades to progress only.
- Persisted queue with stale file paths: items whose source file vanished fail with the path named.

## Eng review

- Scope challenge: queue and feed share the agent's per-session event plumbing and are each about
  one and a half sprints; separate epics would each be under the two-sprint floor.
- Hidden coupling check: GCP sees only `follow(uri, offset)`; PRN never imports GCP code.
- Zero silent failures: every queue failure keeps the item visible with its error until dismissed.
- Reversibility: `PrinterRegistry.upload` without the queue (direct) stays available behind a
  setting for debugging.

## Coordinator reconciliation

- The live-follow row stays with GCP; this epic only supplies the feed.
