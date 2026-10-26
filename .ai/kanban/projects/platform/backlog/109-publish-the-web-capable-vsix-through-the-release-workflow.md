---
id: 109
title: Publish the web-capable VSIX through the release workflow
type: chore
priority: P2
effort: S
model: sonnet
area: [web]
story: US56
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [84, 25, 26]
created: 2026-10-25
---

The tag-driven release for a module with a `browser` entry publishes the VSIX that carries it to each marketplace and fails by name at the web assertion step if the VSIX content assertion fails.

**Code:** `.github/workflows/` (module: `tooling`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] A test tag on the sample web extension produces a VSIX with the `browser` entry; a broken browser bundle fails the release at the named step before any publish
- [ ] Idempotent up to the publish steps, as for other modules

## Tasks

- [ ] Add the assertion step
- [ ] Test tag run

## Progress

Not started.
