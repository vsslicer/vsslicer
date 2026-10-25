---
id: 26
title: Add idempotent per-marketplace publish steps with named failures
type: feature
priority: P0
effort: M
model: sonnet
area: [publishing]
story: US6
milestone: "VSS:M1"
depends_on: [25]
created: 2026-10-25
---

Each marketplace step asks whether the version exists and skips it; a failure names the marketplace; the other still runs.

## Acceptance criteria

- [ ] Re-running a published tag reports both versions already published and exits 0
- [ ] With one marketplace's credential revoked, the job is red naming that marketplace and the other publish still lands (rehearsed on the throwaway pack)
- [ ] `ovsx publish` and `vsce publish --packagePath` are used with the output of the VSIX step

## Tasks

- [ ] Write existence checks
- [ ] Write the two publish steps with `continue-on-error` and a final summary step
- [ ] Rehearse each failure

## Progress

Not started.
