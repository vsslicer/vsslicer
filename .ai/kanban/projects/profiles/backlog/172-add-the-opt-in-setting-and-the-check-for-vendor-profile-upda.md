---
id: 172
title: Add the opt-in setting and the Check for vendor profile updates command
type: feature
priority: P2
effort: M
model: sonnet
area: [importers]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [171, 64]
created: 2026-10-25
---

Setting `vsslicer.profiles.updates.enabled` (default false) and a command that, when enabled, checks the vendors that are installed and lists the newer versions with their changed presets; there is no timer and no check at activation.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/...` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With the setting off the command explains how to enable it and makes no request; with it on it lists newer versions from the fixture sources and the changed presets
- [ ] No call happens at activation or on import in either state (spied source)
- [ ] The listing names the source and the version compared

## Tasks

- [ ] Setting
- [ ] Command
- [ ] Result list
- [ ] Tests

## Progress

Not started.
