---
id: US15
title: "The agent starts once per user and only authenticated clients can use it"
status: reviewed
epic: VSS:E22
---

As a user with several windows, I want `vsslicer-agent` to start on first need, run once, listen on an owner-only local socket and require a token, so that nothing else on my machine can drive my printers.

## Acceptance criteria

- [ ] The Electron-as-Node spike result is recorded for macOS, Windows and Linux with the current VS Code, with the fallback decided (a `node` on PATH or a bundled Node)
- [ ] Single instance via a lock file; the socket name includes the product name (Stable, Insiders and VSCodium do not share)
- [ ] A client without the token is refused; the socket and token file are not readable by another user (POSIX permissions test; Windows pipe ACL checked manually)
- [ ] The agent passes the `@vsslicer/agent-protocol` conformance suite with one command
- [ ] The agent is shipped inside `vsslicer.printers`

## Out of scope

- Running on a remote host (the agent always runs on the UI machine); camera proxy.
