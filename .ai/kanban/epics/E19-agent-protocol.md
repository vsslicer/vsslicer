---
id: E19
title: Build @vsslicer/agent-protocol (JSON-RPC between extensions and the daemon)
status: reviewed
initiative: I4
project: PLT
order: 3
depends_on: [E1]
rows: []
---

Delivers `@vsslicer/agent-protocol`: the versioned JSON-RPC 2.0 contract, transport, authentication and runtime that VSSlicer's UI-kind extensions use to talk to the local `vsslicer-agent` daemon, which keeps printer sessions, camera proxies and job monitoring alive across editor windows (`vscode-platform.md` §1 "Long-running processes", Implications 3). Its users are E22 (the daemon, which uses the server half) and `vsslicer.printers`, `vsslicer.bambu`, `vsslicer.camera` and `vsslicer.fleet` (which use the client half). This epic ships the framework and the core methods; the printer, camera and job method catalogues are added by PRN on top of it.

## Scope

- **In:** `packages/agent-protocol`.
  - Schema: method and notification definitions in TypeBox (MIT), which gives TypeScript types and JSON Schema from one source; the JSON Schema is generated into the package and checked in, so other languages can implement a client.
  - Transport: `vscode-jsonrpc` (MIT, the LSP library) over a Unix domain socket (macOS, Linux) or a named pipe (Windows) in the user's runtime directory, created with owner-only permissions. No TCP listener.
  - Authentication: a random token in an owner-only file next to the socket, required by `initialize`; the daemon rotates it on start.
  - Handshake: `initialize { protocolVersion, client, capabilities }` returns the daemon's protocol version and capabilities; a major-version mismatch is the error `AgentVersionMismatch`, which the client surfaces as "VSSlicer agent is out of date: restart it" with a restart action.
  - Error model: JSON-RPC standard codes plus a fixed application range (`Unauthorized`, `NotFound`, `Busy`, `Timeout`, `AdapterError`, `Cancelled`), each with a stable `data.kind` string.
  - Runtime: `AgentServer` (dispatch, validation of every request against its schema at the trust boundary, a 1 MB request cap, a single-instance lock so two windows cannot start two daemons) and `AgentClient` (connect to an existing daemon or spawn the executable path the caller supplies, reconnect with backoff, resubscribe topics after reconnect, cancellation through `$/cancelRequest`).
  - Core methods: `initialize`, `shutdown`, `ping`, `subscribe`/`unsubscribe` (topic notifications), `log.tail`. Namespaced registration (`printer.*`, `camera.*`, `job.*`) that PRN fills.
  - Test kit: an in-memory transport and a fake daemon for extension tests; a conformance suite any server implementation must pass.
- **Data rules:** no bulk binary over RPC. Files are passed by local path (the daemon runs on the same machine); camera frames go through the daemon's loopback HTTP proxy with a per-session token (roadmap "Extension boundaries"), not through this protocol.
- **Code origin:** written new. No upstream code.
- **Out:** the daemon process and its business logic, packaging and auto-start (E22); the printer, camera and job method definitions (E20 and E22, reviewed by PLT); any web build (the web extension host has no sockets, `vscode-platform.md` §6).

## Feature-matrix rows

None. This is platform work behind the §11, §12 and §15 rows (PRN).

## Acceptance criteria

- [ ] CI regenerates the JSON Schema from the TypeBox definitions and fails if it differs from the committed file (regression caught: a type change that silently breaks other clients).
- [ ] A request with a wrong or missing token is refused with `Unauthorized` and the connection is closed; a test on Linux and macOS asserts the socket and token file are owner-only (mode 0600/0700); on Windows the pipe ACL test runs in CI.
- [ ] Version: a client one major version ahead receives `AgentVersionMismatch`; the client turns it into the user-visible message and restart action (integration test with a sample extension).
- [ ] Validation: every invalid request in a property-based test (fast-check, random params per method) returns `InvalidParams` and the server stays up; a 2 MB request is refused with a named error.
- [ ] Reconnect: killing the reference server mid-subscription makes the client emit `disconnected`, reconnect when the server returns, resubscribe, and receive the next notification; no notification is delivered twice (sequence numbers).
- [ ] Single instance: two clients started at the same moment with no daemon running end up connected to one server process (repeated 50 times in CI).
- [ ] Cancellation: cancelling a long request reaches the handler's `AbortSignal` and the client receives `Cancelled`.
- [ ] The conformance suite passes against the reference server in this package and is runnable by E22 against the real daemon with one command.
- [ ] The fake daemon lets a sample extension's `@vscode/test-electron` test exercise subscribe and request without a real daemon.

All verification is on fixtures and the reference server; no printer or H2C is involved in this epic (D5).

## Dependencies

- Needs: E1 (monorepo, CI, harnesses).
- Exposes: `AgentClient`, `AgentServer`, the schema DSL, the core methods, the conformance suite and the fake daemon to E20 (method types for status and capability flags), E22 (the daemon) and the UI-kind PRN extensions.
- Not on the M1 critical path: I1's exit criteria do not need it, and its first consumer is E22 in I4. It is scheduled after E2 and may slip to the first sprint of I4 without moving M1.

## Risks and spikes

- **Named pipes and socket paths on Windows** (path length, ACLs, antivirus): spike in the first week with `vscode-jsonrpc`'s pipe transport on the Windows runner.
- **Daemon lifetime across VS Code restarts and Remote-SSH**: the client must run in UI-kind extensions only so the socket is on the user's machine (`vscode-platform.md` §1 "Extension kinds"); a test asserts the client refuses to start in a remote extension host with a clear message.
- **Users' acceptance of a background daemon** is roadmap owner question 5; the client never starts the daemon without the calling extension asking, so PRN can gate it behind a setting.

## Eng review

- Scope challenge: the smallest epic is the envelope, transport, auth, handshake and test kit; method catalogues stay with PRN, who knows the printer API. Considered merging into E22; kept separate because D7 gives shared libraries to PLT and the conformance suite should not be written by the only implementer.
- Boring technology: JSON-RPC 2.0 and `vscode-jsonrpc` (the LSP stack every VS Code developer knows), TypeBox and Ajv; no gRPC, no custom framing.
- Blast radius: a daemon crash must not take extensions down; the client turns it into a `disconnected` state and retries, and every pending request fails with a named error rather than hanging (timeout test).
- Security: a local socket with a token and owner-only permissions; another local user or a web page cannot reach it (no TCP).
- Zero silent failures: auth failure, version mismatch, invalid params, oversize request, timeout, cancellation and disconnection each have a test and a defined client-side result.
- Changed because of the review: added the request size cap, the "no bulk binary" rule, sequence numbers for notifications and the remote-host refusal.

## Coordinator reconciliation

- Moved from I1 to I4 by the coordinator: its only consumer is the daemon epic. The Electron-as-Node child-process spike is shared with the SLC engine epic.
