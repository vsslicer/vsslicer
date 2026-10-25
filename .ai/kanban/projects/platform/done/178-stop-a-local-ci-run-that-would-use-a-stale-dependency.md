---
id: 178
title: Stop a local ci run that would use a stale dependency
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-178-worker
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Script `vsslicer/scripts/run.mjs`. Publishing is skipped when the version exists, so local runs test against old dependency code after an unbumped edit (finding 6). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [x] `run.mjs ci` fails first when a module has uncommitted changes to published files without a version bump and CHANGELOG entry
- [x] A test covers it

## Tasks

- [x] Run `version-check --base HEAD` at the start of `ci`
- [x] Test in `scripts/test`

## Progress

Done. `run.mjs ci` now runs `version-check --base HEAD` first (working tree plus untracked files; the existing version-check already diffs the working tree and lists untracked files) and exits 1 naming the module, with the fix (bump + CHANGELOG), before any install/publish. Escape hatch `--allow-unbumped` documented in CONTRIBUTING.md. Test written first in a scratch git repo (failed before the fix, passes after); runner tests 44/44 pass. Real `run.mjs ci` not run. Paths read as vsslicer/.

Files: vsslicer/scripts/run.mjs, vsslicer/scripts/test/versioning.test.mjs, CONTRIBUTING.md, .reference/notes/PLT-178-ci-stale-guard.md
