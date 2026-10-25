---
id: US7
title: "The Bambu adapter design follows the spike and a recorded H2C session"
status: reviewed
epic: VSS:E21
---

As a maintainer, I want the Bambu adapter designed from the PRN-1 decision (depend, port or re-implement) and from a recorded H2C session, so that code is not written against guesses about firmware, the `fun` flag, the CA file or accepted commands.

## Acceptance criteria

- [ ] A design note names the chosen implementation, licence, revision and the dependency mode from PRN-1, and how the module is laid out; AGPL/GPL code ported under D2 carries original notices and a `Ported from` line
- [ ] A recorded H2C session (firmware version and date recorded) holds `push_status` captures, the `fun` flag value, the CA chain and the accepted `print` commands, and becomes fixtures with a PROVENANCE note
- [ ] Cloud mode and the closed `libbambu_networking` are out and the note says so

## Out of scope

- Cloud mode; camera; adapter code.
