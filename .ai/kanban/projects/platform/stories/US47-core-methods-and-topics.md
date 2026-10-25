---
id: US47
title: "A consumer can ping, subscribe to topics, tail logs and shut the daemon down"
status: reviewed
epic: VSS:E19
---

As a PRN developer building on the protocol, I want the core methods `initialize`, `shutdown`, `ping`, `subscribe`/`unsubscribe` and `log.tail` working end to end, so that I only add the printer, camera and job methods.

## Acceptance criteria

- [ ] `ping` round-trips; `shutdown` stops the reference server cleanly and the client sees a clean close
- [ ] `subscribe`/`unsubscribe` deliver topic notifications only to subscribed connections; a connection that drops is unsubscribed (no leaked subscription)
- [ ] `log.tail` returns the last N lines from a log source the server is given and can follow new lines as notifications
- [ ] A runnable reference server wires the core methods to the real transport for tests and for E22's conformance runs

## Out of scope

- Printer, camera and job methods; log rotation and storage (E22).
