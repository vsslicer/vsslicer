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
sprint: "VSS:SP3"
depends_on: [30]
created: 2026-10-25
---

Typed request, response and notification messages with a schema version and a handshake on every webview (re)load; the envelope only, payloads stay opaque.

## Acceptance criteria

- [x] Types and a runtime validator for the envelope; unknown versions give a version-mismatch error and a reload request
- [x] Handshake runs on every load and after reload (test over a fake channel)
- [x] Protocol written down in the package README

## Tasks

- [x] Design the envelope with the spike's findings if available
- [x] Implement validators
- [x] Test handshake and mismatch

## Progress

Done in webview-kit 0.2.0 (published to the local registry). `src/domain/protocol.ts` (envelope types, `parseEnvelope`,
`VersionMismatchError`), `src/application/channel.ts` + `handshake.ts` (`serveHandshake`, `handshake`), exported from
`/host` and `/webview`; protocol in the README. Tests: `test/protocol.test.ts`, `test/handshake.test.ts`. No spike
findings existed yet; designed from vscode-platform.md §2. Left for PLT-35: handshake timeout and hello retry.
