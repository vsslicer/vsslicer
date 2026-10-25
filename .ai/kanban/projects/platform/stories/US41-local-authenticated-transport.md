---
id: US41
title: "The daemon is reachable only by the local user, over a socket or pipe with a token"
status: reviewed
epic: VSS:E19
---

As the owner of a machine running VSSlicer, I want the agent daemon reachable only through an owner-only Unix socket or Windows named pipe guarded by a token, so that no other local user, process of another account or web page can control my printers.

## Acceptance criteria

- [ ] The Windows named-pipe spike records path length, ACL and antivirus findings on the Windows CI runner and states the chosen pipe naming
- [ ] The socket directory is 0700 and the socket and token file are 0600 on Linux and macOS (asserted by a test); the Windows pipe ACL test runs in CI
- [ ] The token is random, in an owner-only file next to the socket, and the server rotates it on every start
- [ ] A request with a wrong or missing token is refused with `Unauthorized` and the connection is closed (over a real socket on all three operating systems)
- [ ] There is no TCP listener (a test lists the server's open handles)

## Out of scope

- Remote or multi-user access; encryption beyond OS permissions; auto-start and packaging of the daemon (E22).
