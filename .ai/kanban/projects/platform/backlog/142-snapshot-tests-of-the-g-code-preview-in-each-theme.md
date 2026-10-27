---
id: 142
title: Snapshot tests of the G-code preview in each theme
type: chore
priority: P3
effort: M
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M8"
sprint: "VSS:SP52"
depends_on: [134, 135, 38, 17, 102, GCP-75]
created: 2026-10-25
---

Playwright snapshots of the preview webview in each of the four themes through the E2 webview stub; Linux CI only. Depends on the final cards of the G-code extension.

**Code:** `vsslicer/modules/apps/themes/test/snapshots/preview/` (module: `themes`, layer: n/a (tests))

## Acceptance criteria

- [ ] One snapshot per theme of the preview on the golden fixture; a regenerate workflow updates them
- [ ] A theme that makes text unreadable (contrast below AA) is caught by the contrast script and not by pixel diff alone
- [ ] Run on SwiftShader in CI; not verified on the H2C

## Tasks

- [ ] Write the Playwright test with the stub
- [ ] Generate and review the baselines

## Progress

Not started.
