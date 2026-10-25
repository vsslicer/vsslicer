---
id: E20
title: Define the generic printer API and the printer registry
status: reviewed
initiative: I4
project: PRN
order: 1
depends_on: [E20]
rows: ["§11 Status, telemetry and job control"]
---

Delivers `@vsslicer/printer-api`, the capability-based contract every printer family implements
(`PrinterAdapter`, `Session`, `Discoverer`, `CameraSource`, normalised status, capability flags), and
the smallest `vsslicer.printers` extension that hosts adapters: a registry, a Printers tree view,
manual add, secrets in SecretStorage and job-control commands. It is for adapter authors (Bambu in
E21, open ecosystems in E23, serial and vendor adapters later) and for every other extension that sends
to or watches a printer (slicer, G-code preview, filament, fleet). D3 makes this the first epic of I4,
designed with the Bambu adapter in view.

## Scope

In:
- `@vsslicer/printer-api` (new code, AGPL-3.0-or-later): types and a small runtime. Capabilities as
  `printer-connectivity.md` §6 proposes (`upload`, `uploadAndStart`, `start`, `pause`, `resume`,
  `cancel`, `listFiles`, `deleteFile`, `fileMetadata`, `thumbnails`, `telemetryPush`,
  `telemetryPoll`, `rawGcode`, `webcamSnapshot`, `webcamStream`, `queue`, `history`, `multiMaterial`,
  `filamentSync`, `discovery`, `pairing`, `remoteWorkspaceSafe`), with `readOnly` and `requiresMode`
  annotations so Bambu's Developer Mode gating (`bambu-connectivity.md` §3) is expressible.
- Normalised `PrinterStatus`: state enum `idle|printing|paused|error|busy|offline` plus the vendor
  state string, temperatures, job progress, file position (byte offset) for live follow,
  `materials[]` (tray, type, colour, remain) for AMS and Spoolman feedback, `notifications[]` (HMS and
  similar, with severity and code).
- Auth schemes declared by the adapter (`apikey`, `digest`, `session`, `bearer`, `token`, `pairing`,
  `accessCode`); secrets go through a `SecretStore` the host provides (VS Code SecretStorage).
- Upload as a stream with progress and `AbortSignal`; every error is a typed `PrinterError`
  (`auth`, `unreachable`, `timeout`, `refused`, `busy`, `unsupported`, `protocol`, `fileRejected`).
- Adapter contract test kit (`@vsslicer/printer-api/testing`): a suite every adapter runs against
  its fixtures, plus a fake in-memory adapter.
- `vsslicer.printers` (`extensionKind: ["ui"]`): `PrinterRegistry` export (list, status events,
  `upload(uri, opts)`, `job`, `files`, `cameras()`), registration API for adapter extensions,
  Printers tree view with status and progress, commands start/pause/resume/cancel, manual "Add
  printer" by host and adapter id, settings for printer connections.

Out: real adapters (E21, E23), discovery implementations (E23), the daemon (E22; sessions run in the
extension host here), file browsing UI (E24), queue (E25), camera UI (E38).

## Feature-matrix rows

- §11 Status, telemetry and job control (P1): done when the registry shows normalised status from
  any registered adapter, job commands are enabled only by capability, and the contract kit tests the
  status and job surface. The row's per-family behaviour is proven by E21 (Bambu) and E23 (open
  ecosystems), which run this kit.

## Acceptance criteria

- [ ] `@vsslicer/printer-api` published from the monorepo with API docs; `tsc --noEmit` on a
      Marlin-serial-shaped adapter that implements only `upload` and `telemetryPoll` passes (thin
      adapters are legal)
- [ ] Contract kit runs against the fake adapter in CI: connect, status, subscribe/unsubscribe,
      upload with progress and abort, job commands gated by capability, every `PrinterError` kind
- [ ] Unit tests for state normalisation tables (vendor string to enum) with a case per state named
      in `printer-connectivity.md` §1 (PrusaLink's nine states, Moonraker `print_stats.state`) and
      Bambu `gcode_state` values from ha-bambulab `mock_data` (MIT)
- [ ] Registry: an adapter extension registers, a printer is added manually, its secret is stored
      in SecretStorage and never written to settings or logs (test greps the settings file and the
      output channel)
- [ ] Tree view and commands verified in an `@vscode/test-electron` integration test with the fake
      adapter; a job command on an adapter without the capability is hidden, not failing
- [ ] Every error class has a user-visible result (notification or tree item state) and a test
- [ ] API review sign-off: the Bambu spike (E21) and one open adapter (Moonraker) are sketched
      against the types before the API is frozen at 0.1
- Verified only on fixtures and the fake adapter (D5); the H2C is first used in E21.

## Dependencies

- Needs E20 (monorepo, CI, test tooling, publishing).
- Exposes `@vsslicer/printer-api` to E21, E23, E59, E60; `CameraSource` to E38;
  `PrinterRegistry` to SLC (send after slicing), E38 (live follow feed, via E25), E42
  (`materials[]` feedback), E46 and E47.
- Printer connections reference PRF's `printer_instance` id (E59 schema) but do not depend on
  PRF code; the link is an optional string field so I4 can start before I3 finishes.

## Risks and spikes

- API shaped by easy adapters and broken by Bambu: mitigated by the API review criterion above with
  the E21 spike's findings; the API stays 0.x until E23 ships.
- Status push vs poll differences (PrusaLink and RRF poll only): the API exposes `subscribe` always
  and adapters poll internally; the contract kit tests both through the fake adapter.
- Workspace-kind extensions calling a UI-kind registry under Remote-SSH: spike (1 day) with a
  workspace extension calling `vsslicer.printers` exports across hosts; if exports do not cross the
  boundary, expose commands instead (`vscode-platform.md` §1 Extension kinds).

## Eng review

- Scope challenge: the anchor was the library alone. A library nobody can drive gives no user
  verification and leaves E21 without a host, so the minimal registry and tree view moved in; the
  open adapters and discovery stay in E23. Two to three sprints.
- Blast radius: an adapter throwing inside the shared extension host would break other extensions;
  the registry wraps every adapter call, turns throws into `PrinterError`, and runs nothing heavy
  on the host thread.
- Reversibility: the API is 0.x; breaking changes are allowed until E23 closes, then semver.
- No silent failures: the contract kit asserts that each error kind reaches the tree view.

## Coordinator reconciliation

- PRF owns `printer_instance`; PRN owns the connection (host, adapter, secrets) and links by id; no hard dependency on PRF's printer_instance epic, agree the interface first. Add a capability flag and a tag-payload event for OpenPrintTag (FIL tag epic).
