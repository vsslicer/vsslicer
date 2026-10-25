---
id: 178
title: Stop a local ci run that would use a stale dependency
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Script `vsslicer/scripts/run.mjs`. Publishing is skipped when the version exists, so local runs test against old dependency code after an unbumped edit (finding 6). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [ ] `run.mjs ci` fails first when a module has uncommitted changes to published files without a version bump and CHANGELOG entry
- [ ] A test covers it

## Tasks

- [ ] Run `version-check --base HEAD` at the start of `ci`
- [ ] Test in `scripts/test`

## Progress

Not started.
