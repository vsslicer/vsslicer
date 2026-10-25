---
id: US42
title: "An extension learns at connect time whether the agent is compatible, and what to do if not"
status: reviewed
epic: VSS:E19
---

As a user of any VSSlicer UI extension, I want the connection to check protocol versions and refuse remote hosts clearly, so that an old daemon after an update produces "VSSlicer agent is out of date: restart it" with a restart action instead of odd failures.

## Acceptance criteria

- [ ] `initialize { protocolVersion, client, capabilities }` returns the daemon's protocol version and capabilities; no other method works before it
- [ ] A client one major version ahead receives `AgentVersionMismatch`; the extension shows the out-of-date message with a restart action (integration test with a sample extension)
- [ ] The client refuses to start in a remote extension host and says why (unit test with a stubbed `vscode.env.remoteName`)
- [ ] The client never starts the daemon unless the calling extension asks (test: constructing a client spawns nothing)

## Out of scope

- Updating or restarting the daemon (E22); negotiating minor-version feature flags beyond the capabilities object.
