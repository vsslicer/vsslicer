---
id: US56
title: "A user is told why a plate cannot go to a printer: nozzle, material and model checks"
status: reviewed
epic: VSS:E47
---

As a owner of printers with different nozzles and loaded materials, I want a compatibility check before every dispatch, so that a wrong print is never started and a mismatch is explained.

## Acceptance criteria

- [ ] Pure check on fixture printers and materials: nozzle mismatch, material mismatch, model mismatch each block with a reason; an unknown material warns and the user decides; a target of `any` picks the first idle match and asks for confirmation
- [ ] Printer model and nozzle come from the connection, the live status (Bambu reports its nozzle) and the linked `printer_instance`; material from loaded trays or, when the printer does not report it, from the filament inventory
- [ ] Material matching is type plus colour until the matching rule is agreed with the filament project
- [ ] A blocked item stays in the queue with its reason shown

## Out of scope

- Slicing for the target.
- Matching by filament profile id.
