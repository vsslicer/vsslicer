---
id: US30
title: "Tagged Bambu spools are matched or created automatically"
status: reviewed
epic: VSS:E44
---

As a Bambu owner, I want an AMS-reported tagged spool matched to my spool by `tag_uid`, else `tray_uuid`, or offered as a new spool linked to the catalogue filament, so that I stop assigning tagged spools by hand.

## Acceptance criteria

- [ ] A tagged tray matches an existing spool by `tag_uid`; an unknown tag creates a spool linked to the `GFA00` catalogue filament (setting ask, always or never; default ask)
- [ ] An all-zero `tag_uid` creates nothing
- [ ] Fallback to the tray's own fields when the catalogue has no `tray_info_idx` match

## Out of scope

- Reading or decrypting MIFARE cards, writing tags
