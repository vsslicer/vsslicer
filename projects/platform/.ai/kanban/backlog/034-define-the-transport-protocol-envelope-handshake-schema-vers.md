---
id: 34
title: "Define the transport protocol: envelope, handshake, schema version"
type: feature
priority: P0
effort: M
model: opus
area: [webview-kit]
story: US8
milestone: "VSS:M1"
depends_on: [30]
created: 2026-10-25
---

Typed request, response and notification messages with a schema version and a handshake on every webview (re)load; the envelope only, payloads stay opaque.

## Acceptance criteria

- [ ] Types and a runtime validator for the envelope; unknown versions give a version-mismatch error and a reload request
- [ ] Handshake runs on every load and after reload (test over a fake channel)
- [ ] Protocol written down in the package README

## Tasks

- [ ] Design the envelope with the spike's findings if available
- [ ] Implement validators
- [ ] Test handshake and mismatch

## Progress

Not started.
