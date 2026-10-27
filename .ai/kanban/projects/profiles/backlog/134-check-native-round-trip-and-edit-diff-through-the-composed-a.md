---
id: 134
title: Check native round trip and edit-diff through the composed adapters
type: feature
priority: P0
effort: M
model: opus
area: [export]
story: US23
milestone: "VSS:M3"
sprint: "VSS:SP22"
depends_on: [59, 144, 141, 142, 143, 137, 138, 139]
created: 2026-10-25
---

The end-to-end counterpart of the core's export use case: with real exporters registered, import then export is byte-equivalent and one edited key changes one line.

**Code:** `vsslicer/modules/apps/profiles/test/integration/` (module: `profiles-extension`, layer: `presentation`, integration test)

## Acceptance criteria

- [ ] Import then export is byte-equivalent for every user preset fixture and for 200 sampled vendor presets per ecosystem
- [ ] Changing one unified key on an imported Orca process gives a native file whose diff to the original is that one key
- [ ] Exports of bundles and instances contain no credentials (extends the leak scan)

## Tasks

- [ ] Compose the exporters
- [ ] Round-trip tables
- [ ] Edit-diff test

## Progress

Not started.
