---
id: 116
title: Test that extension UUIDs match open-vsx.org
type: chore
priority: P2
effort: S
model: sonnet
area: [registry]
story: US60
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [113]
created: 2026-10-25
---

Catches the regression where random UUIDs break auto-update (`vscode-platform.md` section 5, "UUIDs").

**Code:** `vsslicer/modules/tooling/openvsx-registry/test/uuid.test.ts` (module: `openvsx-registry`, layer: n/a (tests))

## Acceptance criteria

- [ ] For three public extensions, the UUID served by the local instance equals the one on open-vsx.org
- [ ] The test fails with both values printed when they differ
- [ ] Verified in CI against open-vsx.org; skipped with a logged reason when offline

## Tasks

- [ ] Write the comparison test
- [ ] Wire it into the module CI job

## Progress

Not started.
