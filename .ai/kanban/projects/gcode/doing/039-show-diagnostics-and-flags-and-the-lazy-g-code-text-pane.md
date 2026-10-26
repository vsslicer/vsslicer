---
id: 39
title: "Show diagnostics and flags, and the lazy G-code text pane"
type: feature
priority: P0
effort: M
model: sonnet
area: [editor]
story: US13
milestone: "VSS:M1"
sprint: "VSS:SP7"
owner: sp7-gcp-39
depends_on: [36, 14]
created: 2026-10-25
---

Zero silent failures: every E3 diagnostic and E4 flag is visible.

## Acceptance criteria

- [x] All E3 diagnostics with 'go to offset' and E4 flags (assumed limits, estimate, invisible macros) appear in the panel (test per flag)
- [x] The text pane reads lines from disk by file offset around the current move (test with a 500 MB-class synthetic file does not read the whole file)
- [x] Bounds (rule 25): the text pane reads at most 64 KiB around the current offset per request and at most 400 lines; lines are clipped to 4 KiB; the panel lists at most 10,000 diagnostics with a count of the rest
- [x] Hostile test: a synthetic file with a 10 MB single line and 100,000 diagnostics stays within those bounds

## Tasks

- [x] Diagnostics list
- [x] Flag banner
- [x] Offset reader pane

## Progress

Done. Flags: `src/domain/flags.ts` (assumed limits, assumed flavour, estimate, invisible macros = markers kept by name but not timed, excluding G4/ESTIMATOR_ADD_TIME with seconds and zero-time M486/EXCLUDE_OBJECT*; at most 1000 distinct names tracked, 8 listed). Diagnostics: `MAX_DIAGNOSTICS` raised 200 to 10,000, messages clipped to 256, count of the rest shown. `summarise` carries `flags`. Text pane: `src/domain/text-window.ts` (bounds 64 KiB / 400 lines / 4 KiB per line, request validation, window lines around the offset, `moveFileOffset`), port `ReadAt` + `readTextWindow` in `src/application/read-text.ts`, adapter `src/adapters/file-read.ts` (pread of one range), `Method.text`/`Method.textWindow` served in `preview-session.ts` (third arg `readAt`, given by `provider.ts` for plain local `.gcode` only: `.bgcode`/`.gcode.3mf` offsets are not file offsets, so the panel says the text is for plain .gcode only). Panel: `side-panel.ts` renders Caveats, Diagnostics with "Go to offset N" buttons, and the G-code pane with a "Show current move" button (webview `main.ts` reads the current move's fileOffset from the move buffers); the focused line is bold with aria-current; stale answers (older seq) are dropped.
Files: src/domain/{flags,text-window,summary}.ts, src/application/{read-text,preview-session}.ts, src/adapters/file-read.ts, src/presentation/{provider.ts,webview/side-panel.ts,webview/main.ts}, test/text-window.test.ts (new), test/panel.test.ts.
Verified (module): eslint, prettier, `pnpm test` 91 pass (flag per kind, 1M macro names, 100,000 diagnostics, virtual 500 MB file reads exactly one 64 KiB range, 60,000-line cap of 400, real 10 MB single-line file in os tmpdir reads 64 KiB and returns one 4 KiB-clipped line, invalid requests, CRLF/bad UTF-8, panel DOM as text); esbuild bundles ok. `tsc`/full build fail only on test/snapshots.spec.ts (GCP-110, Playwright).
Not done: the pane updates on button/go-to only, not live while playing; the 10,000 diagnostics render as one unvirtualised list; no Playwright/visual check of the panel.
Shared-file changes: none (CHANGELOG line suggestion: "Diagnostics and flags in the side panel; lazy G-code text pane (64 KiB / 400 lines / 4 KiB per line)").

Review (sp7-rev-gcp3): FAIL.
- Request flood is unbounded (rule 25): src/application/preview-session.ts:156-160 starts a `readTextWindow` for every `Method.text` notification with no in-flight cap, and src/adapters/file-read.ts:9-12 opens the file and allocates a 64 KiB buffer per request. Repro (scratch probe calling `readTextWindow(fileReadAt(p), {seq:i, offset:i*100})` 20,000 times concurrently, as a webview loop posting `Method.text` would): peak RSS +1.48 GB in 2.5 s; 100,000 messages would take the extension host past 7 GB. Fix: keep at most one read in flight per session and coalesce to the latest request (older seqs are dropped by the webview anyway), with a hostile test that posts e.g. 100,000 requests and asserts at most one or two reads.
Passed otherwise: payload is only {seq, offset}; the path is the open document's (provider.ts passes `fileReadAt(uri.fsPath)` only for `file:` scheme + plain `.gcode`), extra fields (path, length) are ignored; offset -1, NaN, Infinity, 1e300, '5', non-integer seq, null are dropped; 2^53-1 and past-EOF return focus -1, no lines; 64 KiB read / 400 lines / 4 KiB per line held on a 200,000-line file with 6000-byte lines. Panel uses no innerHTML. Invisible-macros definition (markers kept by name but not timed, excluding timed G4/ESTIMATOR_ADD_TIME and zero-time M486/EXCLUDE_OBJECT*, 1000 names tracked, 8 listed) is a sensible reading of the E4 "time is missing from the total" caveat. lint/test(91)/build green except third-party-notices (saxes, PLT-194).
