---
id: US2
title: "An adapter author implements a printer family against a small typed contract"
status: reviewed
epic: VSS:E20
---

As an adapter author, I want `@vsslicer/printer-api` to define the adapter, session, capability flags, normalised status, typed errors, auth schemes and a streaming upload, so that a family as thin as a Marlin-serial upload-and-poll adapter or as rich as Bambu can implement only what it supports and every consumer reads the same shapes.

## Acceptance criteria

- [ ] `@vsslicer/printer-api` is published to the local registry with API docs; `tsc --noEmit` on a Marlin-serial-shaped adapter that implements only `upload` and `telemetryPoll` passes (thin adapters are legal)
- [ ] Capabilities cover the `printer-connectivity.md` section 6 list, with `readOnly` and `requiresMode` annotations that can express Bambu's Developer Mode gating
- [ ] `PrinterStatus` carries state enum plus vendor state string, temperatures, job progress, file position (byte offset), `materials[]` and `notifications[]` (code, severity)
- [ ] Upload is a stream with progress and `AbortSignal`; every failure is a `PrinterError` of one of the eight kinds
- [ ] Auth schemes are declared by the adapter and secrets come only through a host-provided `SecretStore`

## Out of scope

- Real adapters (E21, E23), discovery implementations, the daemon, camera UI.
