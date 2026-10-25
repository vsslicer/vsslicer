---
id: US63
title: "Check for a newer vendor profile version on request, only if I opted in"
status: reviewed
epic: VSS:E57
---

As a user, I want VSSlicer to tell me when a vendor's profiles have a newer upstream version, but only after I turned the check on and asked for it, so that nothing contacts the network without my say-so.

## Acceptance criteria

- [ ] With the setting off (the default) no network request is made by anything in the profile modules, including at activation and import (test with the network blocked)
- [ ] With the setting on, an explicit command lists vendors whose upstream version is newer: Prusa by a newer upstream commit or the `preset-repo-api.prusa3d.com` indices, Orca and Bambu by a new data package release, Cura by a newer pinned release
- [ ] Detection lists the changed presets between the two versions
- [ ] The command reports the source and version it compared against

## Out of scope

- Automatic or background updates; maintaining our own vendor library; cloud sync (E58).
