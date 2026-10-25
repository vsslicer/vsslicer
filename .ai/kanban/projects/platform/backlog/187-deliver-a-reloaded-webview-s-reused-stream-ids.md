---
id: 187
title: "Deliver a reloaded webview's reused stream ids"
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP4"
docs: [.ai/audits/SP3-audit.md]
created: 2026-10-25
---

Module: webview-kit (application, README). Finding 2 of the SP3 audit, `.ai/audits/SP3-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] A reloaded webview that reuses a stream id still delivers its buffer: completed ids are cleared on a new handshake session, or ids are documented unique per receiver lifetime and generated with crypto.randomUUID() (test with a reload)

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] Release a patch version of each changed module

## Progress

Not started.
