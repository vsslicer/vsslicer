---
id: 103
title: Rescan only the edited lines for unknown-command warnings
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP6"
docs: [.ai/audits/SP5-audit.md]
created: 2026-10-26
---

Module: gcode-language (application, presentation). Finding 6 of the SP5 audit, `.ai/audits/SP5-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] An edit to a 40 MB file does not re-read the whole document: met by the 4 MB gate in schedule (the audit says a size check is enough); no timed test, the handler needs VS Code
- [x] A test that fails before the fix

## Tasks

- [ ] Fix as the audit describes

## Progress

Done: size.ts scansOnEdit / MAX_SCAN_ON_EDIT_CHARS (4 MB); `schedule` skips documents above it (300 ms debounce kept); the unknown-command scan also runs on save, so big files refresh on open and save. Verified: unit test for the threshold; lint, build, test green. Not done: no timed test (the VS Code handler is untestable in plain Node), so criterion 1 is met by design, not measured, and the test criterion covers the threshold only. Changelog: gcode-language: files over 4 MB are scanned for unknown commands on open and save, not after every edit.

Review passed (gcp104-106-103-reviewer): schedule skips docs over 4M chars via offsetAt (no getText), save now scans, open scans, 50 MB gate unchanged; threshold test passes. The audit calls a size check in schedule enough, so the 40 MB criterion is ticked as met by design; no timed test possible outside VS Code. 32 tests green.
