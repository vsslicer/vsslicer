---
id: 5
title: Define the capability flags with readOnly and requiresMode annotations
type: feature
priority: P0
effort: S
model: opus
area: [api]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [2]
created: 2026-10-25
---

The capability set from `printer-connectivity.md` section 6, with the annotations that express Bambu's Developer Mode gating.

**Code:** `vsslicer/modules/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [x] Flags `upload, uploadAndStart, start, pause, resume, cancel, listFiles, deleteFile, fileMetadata, thumbnails, telemetryPush, telemetryPoll, rawGcode, webcamSnapshot, webcamStream, queue, history, multiMaterial, filamentSync, discovery, pairing, remoteWorkspaceSafe`, plus `downloadFile` and `moveFile` needed by `printer://` (E24), each addition documented
- [x] `readOnly` and `requiresMode` annotations: a Bambu-shaped set with Developer Mode off evaluates to read-only with the reason 'requires Developer Mode' (unit test)
- [x] A helper `can(caps, flag)` is the only place consumers test a capability

## Tasks

- [x] Write the flag set
- [x] Write the annotations and helper
- [x] Unit tests incl. the Bambu-shaped gating

## Progress



small-cards-worker: added src/domain/capabilities.ts (24 flags, PRINTER_MODES, annotations, can/isReadOnly/readOnlyReason), exported from domain/index.ts; test/capabilities.test.ts. 18 tests pass, lint, build, checks pass. Coordinator lines: none for src/index.ts (it re-exports domain). CHANGELOG Unreleased: Capability flags with readOnly/requiresMode annotations and can().

Review (sp8-reviewer-26, 2026-10-26 08:38): FAIL
1. vsslicer/modules/printer-api/src/domain/capabilities.ts:57-65: whether a flag mutates the printer is left to each adapter's `readOnly` annotation, and a missing annotation counts as mutating. Probe: Bambu-shaped set (telemetryPush readOnly, upload requiresMode developerMode) plus an un-annotated `discovery` or `remoteWorkspaceSafe` (Bambu SSDP works without Developer Mode, bambu-connectivity.md:147) gives isReadOnly=false, reason=undefined, so the 'requires Developer Mode' state is lost. discovery, pairing, remoteWorkspaceSafe, listFiles, downloadFile, fileMetadata, thumbnails, telemetry*, webcam*, history are not printer mutations at all. Fix: classify mutation in the domain (e.g. a MUTATING_FLAGS const: upload, uploadAndStart, start, pause, resume, cancel, deleteFile, moveFile, rawGcode, queue, filamentSync) and compute read-only from it (the readOnly annotation may stay as an override but must default from the flag); add the probe above as a test.
2. capabilities.ts:3: the comment says "printer-connectivity.md section 6", but section 6 (printer-connectivity.md:184-188) also lists emergencyStop, temperatureControl and motionControl, which the card's list drops. Either add them (they are mutating) or say in the comment that they are left out and why.
3. The "read-only when no mutating flag is usable" rule matches bambu-connectivity.md:85,165,169 (mode F read-only status, prompt for Developer Mode); document it in one line on isReadOnly naming that source.
Ran: pnpm test (18 pass), lint, build, node scripts/run.mjs checks (pass), scratch probe as in 1.

PRN-5-fix: addressed review 1-3. Domain MUTATING_FLAGS const (upload, uploadAndStart, start, pause, resume, cancel, emergencyStop, deleteFile, moveFile, rawGcode, temperatureControl, motionControl, queue, filamentSync) decides read-only; adapter readOnly:true stays only as an exemption. Added emergencyStop, temperatureControl, motionControl (27 flags, printer-connectivity.md:184-188). isReadOnly comment cites bambu-connectivity.md:85,165,169. New probe test (Developer Mode off + discovery + remoteWorkspaceSafe => read-only, Developer Mode reason). 19 tests, lint, build, checks pass. CHANGELOG Unreleased: Capability flags (27) with a domain MUTATING_FLAGS set, readOnly/requiresMode annotations and can().

Review (sp8-reviewer-27, 2026-10-26 08:43): PASS
Re-review after PRN-5-fix. Ran: pnpm test, pnpm lint, pnpm build in the module; `node scripts/run.mjs checks` (exit 0); scratch probe. printer-api 19 tests pass.
- 1 fixed: MUTATING_FLAGS (capabilities.ts:58-73) decides read-only; `readOnly: true` only exempts. Test capabilities.test.ts:44-51 is the Bambu probe (Developer Mode off + un-annotated discovery and remoteWorkspaceSafe => read-only, 'requires Developer Mode').
- 2 fixed: emergencyStop, temperatureControl, motionControl added (27 flags), all in MUTATING_FLAGS; checked against docs/research/printer-connectivity.md:184-188. Citation comment at capabilities.ts:3 now names them.
- 3 fixed: isReadOnly comment cites bambu-connectivity.md:85,165,169.
