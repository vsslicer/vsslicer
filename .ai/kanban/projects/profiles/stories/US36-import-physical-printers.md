---
id: US36
title: "A user imports physical printers from PrusaSlicer, Orca and Cura"
status: reviewed
epic: VSS:E16
---

A user with physical printers or machines configured elsewhere gets them as instances, with credentials moved into SecretStorage and the sources left alone.

## Acceptance criteria

- [ ] Prusa 2.9 `physical_printer/*.ini`, Prusa 3.0 JSON, Orca user machine presets and Cura machine instances keep model, nozzle and host
- [ ] Credentials (`printhost_apikey`, `printhost_password`, access code) go into the vault; unknown host types import with a diagnostic and no connection
- [ ] Re-running the import creates no duplicates; the source files are unchanged

## Out of scope

- Writing back to the other slicers.
