---
id: US49
title: "E22 can prove the real daemon speaks the protocol and consume stable releases"
status: reviewed
epic: VSS:E19
---

As the author of the daemon (E22), I want a conformance suite runnable against any server with one command and versioned releases of the package, so that the real daemon is checked by the same tests as the reference server.

## Acceptance criteria

- [ ] The conformance suite passes against the reference server in this package and runs against an external socket with one command (`pnpm conformance --socket <path> --token-file <path>`)
- [ ] The suite covers handshake, auth refusal, validation, size cap, cancellation, subscribe with sequence numbers and shutdown; breaking one behaviour in the reference server turns it red (meta-test)
- [ ] `agent-protocol@0.1.0` (runtime for the daemon) and `agent-protocol@0.2.0` (test kit, conformance, VS Code helpers) are published to the local registry and a clean consumer installs them
- [ ] The module README documents the protocol, the data rules (no bulk binary; files by local path; camera frames through the loopback proxy) and how to add a namespace

## Out of scope

- Running conformance against the daemon in E22's CI (E22 wires it).
