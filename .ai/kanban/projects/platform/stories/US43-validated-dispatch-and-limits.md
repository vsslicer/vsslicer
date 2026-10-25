---
id: US43
title: "Malformed, oversized or unknown requests are rejected with named errors and never crash the daemon"
status: reviewed
epic: VSS:E19
---

As a daemon developer, I want every request validated against its schema at the trust boundary with a fixed error model and a request size cap, so that a buggy extension or hostile local process cannot take the daemon down.

## Acceptance criteria

- [ ] Every invalid request in a property-based test (fast-check, random params per method) returns `InvalidParams` and the server stays up
- [ ] A 2 MB request is refused with a named error; the 1 MB cap is enforced on raw bytes before parsing
- [ ] Standard JSON-RPC codes plus `Unauthorized`, `NotFound`, `Busy`, `Timeout`, `AdapterError`, `Cancelled` each carry a stable `data.kind`; a test pins the code-to-kind table
- [ ] An unknown method returns `MethodNotFound`; a handler that throws returns `AdapterError`-class errors without leaking a stack trace to the client

## Out of scope

- Rate limiting; per-method authorisation beyond the single token.
