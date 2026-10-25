---
id: US31
title: "A user queues uploads that run in the background with progress, cancel and retry"
status: reviewed
epic: VSS:E25
---

As a user sending large files over slow links, I want uploads to continue while I work, with progress, cancel and retry, so that I never wait at a progress bar.

## Acceptance criteria

- [ ] Queue state-machine unit tests: every transition, illegal transitions rejected
- [ ] Integration test with the fake adapter: progress events reach two windows; cancel aborts the stream (the fake server sees the connection closed)
- [ ] Retry policy test: `unreachable` and `timeout` retry with backoff up to the limit; `auth` fails at once with a 'fix credentials' action; no retry for `fileRejected`
- [ ] An Uploads view with progress, cancel, retry and open-target; a status-bar item
- [ ] Three queued uploads to two fixture printers complete in the background with visible progress, one cancelled and one failed and retried

## Out of scope

- Fleet queue and compatibility checks (E47).
