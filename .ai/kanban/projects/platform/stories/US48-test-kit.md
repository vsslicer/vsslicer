---
id: US48
title: "An extension author tests against a fake daemon without a real one"
status: reviewed
epic: VSS:E19
---

As a developer of a UI extension that uses the agent, I want an in-memory transport and a fake daemon, so that my `@vscode/test-electron` tests can exercise subscribe and request without any real daemon.

## Acceptance criteria

- [ ] `@vsslicer/agent-protocol/testkit` exports an in-memory transport pair and a fake daemon that scripts replies and pushes notifications
- [ ] A sample extension's `@vscode/test-electron` test exercises request and subscribe through the fake daemon
- [ ] The fake daemon passes the same core-method contract the real server does, so a fake cannot hide a protocol mismatch (test)

## Out of scope

- A fake printer; recording and replay of real sessions.
