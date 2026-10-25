---
id: 129
title: Add the registry as a third publish target in the release workflow
type: feature
priority: P2
effort: M
model: sonnet
area: [registry]
story: US64
milestone: "VSS:M6"
sprint: "VSS:SP35"
depends_on: [25, 26, 123, 119, 128]
created: 2026-10-25
---

Adds `ovsx publish --registry-url` for our registry to the tag-driven workflow with the same idempotence and named failures as the other two targets. Blocked on a hosting budget (D5, D10): do not start until `PLT-128` records a yes for hosting. Fallback without budget: the target publishes to the local instance in CI only (a test job), and is disabled for real tags.

**Code:** `.github/workflows/release.yml` (module: none, layer: n/a (ci))

## Acceptance criteria

- [ ] Budget gate: Blocked on a hosting budget (D5, D10): do not start until `PLT-128` records a yes for hosting.
- [ ] On a test tag against a local instance, the target publishes, re-running reports "already published", and a refused upload fails the job naming the registry and showing its error
- [ ] The target is off unless a repository variable names the registry URL; with it unset the job logs "registry target disabled" and passes
- [ ] The publishing token only reaches this publish job

## Tasks

- [ ] Add the job and the disabled-by-default switch
- [ ] Add the signature verify step
- [ ] Test on a local instance

## Progress

Not started.
