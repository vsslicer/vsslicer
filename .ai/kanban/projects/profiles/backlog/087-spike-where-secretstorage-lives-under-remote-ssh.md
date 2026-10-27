---
id: 87
title: "Spike: where SecretStorage lives under Remote-SSH"
type: spike
priority: P1
effort: S
model: opus
area: [store]
story: US35
milestone: "VSS:M2"
sprint: "VSS:SP22"
depends_on: [85]
created: 2026-10-25
---

Checks where secrets are kept when the workspace is remote, before release.

**Code:** `vsslicer/modules/apps/profiles/docs/remote-secrets.md` (module: `profiles-extension`, layer: n/a (spike notes))

## Acceptance criteria

- [ ] A written result with the VS Code version and a Remote-SSH run: does the secret follow the UI side, and does `getConnection` still work
- [ ] A README limitation text if it does not

## Tasks

- [ ] Run the experiment
- [ ] Write the result

## Progress

Not started.
