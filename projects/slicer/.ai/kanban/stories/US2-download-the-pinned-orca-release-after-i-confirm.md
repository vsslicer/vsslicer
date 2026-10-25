---
id: US2
title: "Download the pinned Orca release after I confirm"
status: reviewed
epic: VSS:E26
---

As a user without OrcaSlicer, I want VSSlicer to offer the pinned upstream release and install it after I confirm, so that slicing works without a manual install and I can trust the binary.

## Acceptance criteria

- [ ] Nothing is downloaded before the user confirms; the confirmation names the version, size and source
- [ ] Each pinned release has a SHA-256 in the manifest; a mismatch refuses the binary, deletes it and says so
- [ ] Offline, HTTP error and checksum mismatch each produce a distinct message and leave no partial binary (tests against a local HTTP fixture server)
- [ ] The macOS quarantine and Gatekeeper spike is recorded and its outcome decides whether download is offered on macOS or only detection
- [ ] The installed binary lives in `globalStorageUri` and is picked up by detection (US1)

## Out of scope

- Auto-update of the pinned release
- Bundling an engine in the VSIX (E66)
