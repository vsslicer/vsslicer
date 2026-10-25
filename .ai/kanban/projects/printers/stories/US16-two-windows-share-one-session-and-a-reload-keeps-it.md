---
id: US16
title: "A user with two windows sees one session per printer, and a window reload does not drop it"
status: reviewed
epic: VSS:E22
---

As a user with two VS Code windows and a long print, I want both windows to show the same printer session and a reload to keep it, so that the printer has one MQTT connection and status resumes at once.

## Acceptance criteria

- [ ] Integration test (`@vscode/test-electron`, two windows): both windows show the same session; one fake-adapter connection is open (counted at the fake server), not two
- [ ] Window reload test: the session and a running fake job survive; status resumes in under 2 s
- [ ] `vsslicer.printers` is a thin client: the `PrinterRegistry` API is the same as with in-process sessions
- [ ] On the H2C: one MQTT session across two windows over a full print (manual checklist, firmware recorded)

## Out of scope

- Fleet queue (E47).
