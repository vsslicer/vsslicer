---
id: US11
title: "A Bambu owner sees HMS errors as notifications and in the printer's tree item"
status: reviewed
epic: VSS:E21
---

As a Bambu owner, I want HMS entries decoded with code and severity and shown as notifications and in the tree item, with a link to Bambu's public HMS wiki page, so that I notice a problem and know what it is.

## Acceptance criteria

- [ ] `hms` entries from fixtures decode to `PrinterStatus.notifications` with code, severity and a wiki link
- [ ] A new notification raises one VS Code notification, a repeated one does not; the tree item shows the active ones
- [ ] HMS events from the H2C appear as notifications and in the tree item (US14)

## Out of scope

- Mapping every HMS code to prose beyond what the public table gives.
