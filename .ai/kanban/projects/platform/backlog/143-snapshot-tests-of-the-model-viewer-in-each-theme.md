---
id: 143
title: Snapshot tests of the model viewer in each theme
type: chore
priority: P3
effort: M
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M8"
sprint: "VSS:SP52"
depends_on: [134, 135, 38, 17, VWR-388]
created: 2026-10-25
---

Playwright snapshots of the 3MF/model viewer webview in each theme through the E2 stub. Depends on the final release of the project extension.

**Code:** `vsslicer/modules/apps/themes/test/snapshots/viewer/` (module: `themes`, layer: n/a (tests))

## Acceptance criteria

- [ ] One snapshot per theme of the viewer on the 3MF fixture
- [ ] Baselines regenerate through the existing workflow
- [ ] Linux CI only

## Tasks

- [ ] Write the Playwright test with the stub
- [ ] Generate and review the baselines

## Progress

Not started.
