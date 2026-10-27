---
id: US72
title: "A VSSlicer build user installs VSSlicer extensions from a static marketplace on GitHub"
status: draft
epic: VSS:E68
---

As a VSSlicer build user, I want the extensions view to list and install the VSSlicer extensions from an `index.json` on GitHub Pages, whose VSIX files sit on GitHub Releases, so that the build has its own marketplace with no server to run (D24).

## Acceptance criteria

- [ ] `vsslicer/vsslicer-marketplace` generates `index.json` from GitHub Releases, validated by its schema, byte-identical for the same releases
- [ ] The generator enforces the registry policy: licence expression, source link for copyleft, `vsslicer` namespace only
- [ ] A Pages workflow publishes `index.json` and the takedown page
- [ ] A VSSlicer extension release attaches its VSIX and shows up in the published index
- [ ] The extensions view installs from it and refuses a `sha256` mismatch

## Out of scope

- A gallery endpoint (`/extensionquery`); a serverless adapter is a parked spike (PLT-111).
