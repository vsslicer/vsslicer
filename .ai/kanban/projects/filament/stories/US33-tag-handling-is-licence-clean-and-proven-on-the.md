---
id: US33
title: "Tag handling is licence-clean and proven on the H2C"
status: reviewed
epic: VSS:E44
---

As the project owner, I want proof that no file derives from RFID-Tag-Guide and that inserting a Bambu-tagged spool in the H2C assigns it, so that the licence stays clean and the row is verified on hardware.

## Acceptance criteria

- [ ] Licence check: no file derived from RFID-Tag-Guide; MIT notices for OpenPrintTag and ha-bambulab facts present
- [ ] H2C: inserting a Bambu-tagged spool makes it appear assigned in the inventory within one status report (firmware version and date recorded)
- [ ] Which printers expose OpenPrintTag over their API is recorded in a spike

## Out of scope

- Other tag formats
