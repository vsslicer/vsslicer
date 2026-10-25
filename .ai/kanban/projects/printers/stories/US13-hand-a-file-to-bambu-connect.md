---
id: US13
title: "A Bambu owner without Developer Mode hands a file to Bambu Connect"
status: reviewed
epic: VSS:E21
---

As a Bambu owner who does not use Developer Mode, I want a command that opens the file in Bambu Connect through `bambu-connect://import-file`, so that I can still print from VS Code.

## Acceptance criteria

- [ ] The command builds the URL scheme correctly (unit test) and opens Bambu Connect on one of macOS or Windows (manual checklist, owner)
- [ ] On Linux the command explains that Bambu Connect is unavailable instead of failing silently
- [ ] No signing code or Bambu Connect certificate is involved

## Out of scope

- Any use of the leaked Bambu Connect certificate.
