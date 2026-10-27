---
id: 160
title: "Smoke test: install, start, built-in extensions active, stock chrome absent"
type: chore
priority: P0
effort: M
model: sonnet
area: [ci]
story: US67
milestone: "VSS:M6"
sprint: "VSS:SP17"
depends_on: [152, 159, 211, 212, 213, 219, 220]
created: 2026-10-25
---

The first smoke test of the built editor, on linux-x64 under `xvfb`.

**Code:** `test/smoke/` (repo: `vsslicer/vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] The test unpacks the artifact, starts it with a fresh user-data dir, and checks every built-in VSSlicer extension is active
- [ ] Accounts, Extensions (with its MCP views), Run and Debug and Source Control are absent from the activity bar; the Explorer is present
- [ ] The gear menu's Settings opens the VSSlicer settings page; its Extensions entry opens the VSSlicer extensions view
- [ ] The editor quits cleanly; the test fails with a named step otherwise

## Tasks

- [ ] Driver (Playwright's Electron support or the VS Code test harness, whichever the patched build allows)
- [ ] Checks

## Progress

Not started.
