---
id: US44
title: "A caller can cancel a long request and no request hangs forever"
status: reviewed
epic: VSS:E19
---

As an extension author, I want to cancel a request and have every pending call fail with a named error on timeout or disconnect, so that the UI never waits on a request nobody will answer.

## Acceptance criteria

- [ ] Cancelling a long request reaches the handler's `AbortSignal` and the client receives `Cancelled` (via `$/cancelRequest`)
- [ ] A request with no answer within its timeout fails with `Timeout`; a request pending when the connection drops fails with a named disconnect error (timeout test)
- [ ] Cancelling an already finished request is a no-op and leaves no listener behind

## Out of scope

- Cancellation of work already committed on a printer (that is the adapter's decision, E20 and E22).
