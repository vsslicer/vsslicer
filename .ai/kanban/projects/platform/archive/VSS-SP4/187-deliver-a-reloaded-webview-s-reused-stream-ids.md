---
id: 187
title: "Deliver a reloaded webview's reused stream ids"
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: PLT-187-worker
docs: [.ai/audits/SP3-audit.md]
created: 2026-10-25
---

Module: webview-kit (application, README). Finding 2 of the SP3 audit, `.ai/audits/SP3-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] A reloaded webview that reuses a stream id still delivers its buffer: completed ids are cleared on a new handshake session, or ids are documented unique per receiver lifetime and generated with crypto.randomUUID() (test with a reload)

## Tasks

- [x] Write the failing test
- [x] Fix
- [ ] Release a patch version of each changed module

## Progress

`receiveBuffers` clears its finished-id set when a `hello` arrives (new handshake session). Test added (reload reuses id, delivered twice); lint, 96 tests, build pass. Not done: patch release (PUBLISH no; coordinator releases; CHANGELOG under Unreleased).

Files: vsslicer/modules/webview-kit/src/application/transfer.ts, test/transfer.test.ts, README.md, CHANGELOG.md.
