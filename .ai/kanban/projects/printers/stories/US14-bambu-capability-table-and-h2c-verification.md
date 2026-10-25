---
id: US14
title: "The maintainer verifies the Bambu adapter on the H2C and keeps a dated capability table"
status: reviewed
epic: VSS:E21
---

As a maintainer, I want a per-model, per-firmware capability table starting with the H2C, a verified H2C session and a clean VSIX, so that the adapter's claims are tested on the only hardware we have and unknown firmware falls back to read-only.

## Acceptance criteria

- [ ] On the H2C (firmware version and date recorded in the capability table): connect, status, HMS, send a sliced two-colour `.gcode.3mf` with AMS mapping, pause, resume, stop; and with Developer Mode off, read-only status or a recorded failure mode
- [ ] The capability table lives in `docs/`, is dated, and unknown firmware falls back to read-only with a warning
- [ ] A CI step lists the VSIX contents and fails on any closed binary, key or certificate other than Bambu's public CA chain
- [ ] The Bambu part of the hand-off (Mode B) is on the manual checklist

## Out of scope

- Other models beyond what the owner can test (D5).
