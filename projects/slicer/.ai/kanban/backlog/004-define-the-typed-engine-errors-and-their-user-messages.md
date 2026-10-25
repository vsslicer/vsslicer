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
depends_on: [2]
created: 2026-10-25
---

One `EngineError` union with a code, a user message and a remediation: not installed, unsupported version, unknown exit code, exit code (by name), crash (signal), timeout, cancelled, empty output, missing plate output, bad input, and download failures (checksum mismatch, offline, HTTP).

**Code:** `vsslicer/modules/slicer-api/src/domain/...` (module: `slicer-api`, layer: `domain`)

## Acceptance criteria

- [ ] Each variant has a code, message and remediation; a test per variant checks the message text is non-empty and distinct
- [ ] `unknown exit code` carries the raw code and is never mapped to success (regression: modulo-256 wrap)
- [ ] Errors are serialisable (for the daemon later) and carry no stack traces in the message

## Tasks

- [ ] Define the union
- [ ] Message table
- [ ] Tests

## Progress

Not started.
