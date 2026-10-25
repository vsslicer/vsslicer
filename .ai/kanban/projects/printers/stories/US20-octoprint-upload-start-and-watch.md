---
id: US20
title: "An OctoPrint user pairs, uploads, starts and watches the job"
status: reviewed
epic: VSS:E23
---

As an OctoPrint user, I want to pair through AppKeys instead of copying a key, upload with select or print, and see progress and job control, so that OctoPrint printers behave like any other in VS Code.

## Acceptance criteria

- [ ] The contract kit passes for OctoPrint against recorded HTTP and SockJS fixtures
- [ ] OctoPrint's virtual printer runs in CI (Docker) for upload, start, pause and cancel; if not feasible in free CI minutes, the recorded-fixture fallback and a note in the module
- [ ] AppKeys pairing is tested against the virtual printer
- [ ] Verified on fixtures and the virtual printer only (D5)

## Out of scope

- OctoPrint plugins and timelapse.
