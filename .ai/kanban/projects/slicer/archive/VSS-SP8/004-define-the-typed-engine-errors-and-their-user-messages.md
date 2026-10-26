---
id: 4
title: Define the typed engine errors and their user messages
type: feature
priority: P0
effort: S
model: sonnet
area: [engine]
story: US4
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [2]
created: 2026-10-25
---

One `EngineError` union with a code, a user message and a remediation: not installed, unsupported version, unknown exit code, exit code (by name), crash (signal), timeout, cancelled, empty output, missing plate output, bad input, and download failures (checksum mismatch, offline, HTTP).

**Code:** `vsslicer/modules/slicer-api/src/domain/...` (module: `slicer-api`, layer: `domain`)

## Acceptance criteria

- [x] Each variant has a code, message and remediation; a test per variant checks the message text is non-empty and distinct
- [x] `unknown exit code` carries the raw code and is never mapped to success (regression: modulo-256 wrap)
- [x] Errors are serialisable (for the daemon later) and carry no stack traces in the message

## Tasks

- [x] Define the union
- [x] Message table
- [x] Tests

## Progress

Not started.

Review (sp8-reviewer-20, 08:16): PASS
Checked: 13 variants each with code, message, remediation (tests assert non-empty and distinct); unknown-exit-code keeps raw code, 256 is not success; JSON-safe plain data, no stack. Exit codes verified in .reference/repos/OrcaSlicer/src/libslic3r/Utils.hpp (CLI_INVALID_PARAMS -2 line 45, CLI_SLICING_ERROR -100 line 93) and docs/research/slicing-engine-embedding.md:71,83 (Orca typed codes read modulo 256; PrusaSlicer exits 0 on slicing failure, so no Prusa code table is expected). Ran slicer-api pnpm test (6 pass), lint, build. Note (non-blocking): classifyExitCode only reads 128..255 as signed; a positive named code in that range would not match.
