---
id: US45
title: "Subscriptions survive a daemon restart without duplicate notifications"
status: reviewed
epic: VSS:E19
---

As a user watching a print in a window, I want the connection to recover when the daemon restarts, so that live updates resume without reloading the window and without seeing an event twice.

## Acceptance criteria

- [ ] Killing the reference server mid-subscription makes the client emit `disconnected`, reconnect with backoff when the server returns, resubscribe every topic and deliver the next notification
- [ ] No notification is delivered twice: notifications carry per-topic sequence numbers and the client drops repeats (unit and integration test)
- [ ] Backoff is bounded and its delays are testable with a fake clock; `close()` stops reconnecting

## Out of scope

- Replaying notifications missed while disconnected (the client re-reads state with a request after reconnect, PRN's concern).
