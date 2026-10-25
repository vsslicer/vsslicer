---
id: US8
title: "Get Orca presets from my resolved profile"
status: reviewed
epic: VSS:E27
---

As a user with an imported profile, I want the machine, process and filament presets written for Orca from what I selected, so that the slice uses my settings exactly.

## Acceptance criteria

- [ ] `machine.json`, `process.json` and one filament JSON per slot are written from the resolved profile's Orca native form, with Orca key names as canonical (D9)
- [ ] Snapshot tests of the emitted JSON for every fixture profile tuple from PRF's fixture set (a renamed or dropped key changes the snapshot)
- [ ] Round trip: emitting then running Orca `--export-settings` returns the same values for every emitted key (pinned Orca in CI)
- [ ] Start and end G-code templates and placeholders are byte-identical to the imported profile's, `post_process` is stripped from the preset, engine thumbnails are turned off

## Out of scope

- Cura emission (US13 resolves Cura itself)
- Prusa emission (E65)
