---
id: US21
title: "A Prusa user uploads to PrusaLink, starts and watches the job"
status: reviewed
epic: VSS:E23
---

As a Prusa user, I want to upload to PrusaLink v1 with optional print-after-upload and see its status, so that Prusa printers work from VS Code.

## Acceptance criteria

- [ ] The contract kit passes for PrusaLink against recorded fixtures derived from the published API (the `openapi.yaml` is not vendored until its licence header conflict is resolved)
- [ ] `Print-After-Upload: ?0` never starts a print (regression for the firmware bug PrusaSlicer works around)
- [ ] Digest auth with `X-Api-Key` fallback; the adapter probes `/api/version` and falls back to legacy `api/files`; unknown versions are logged with the response
- [ ] Status maps the nine PrusaLink states
- [ ] Verified on fixtures only (D5)

## Out of scope

- Prusa Connect (cloud).
