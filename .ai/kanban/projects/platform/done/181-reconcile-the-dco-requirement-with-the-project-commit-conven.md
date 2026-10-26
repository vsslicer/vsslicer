---
id: 181
title: Reconcile the DCO requirement with the project commit convention
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP9"
docs: [.ai/audits/SP2-audit.md]
created: 2026-10-25
---

Module: scripts / conventions. Finding 4 of the SP2 audit, `.ai/audits/SP2-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] `.ai/instructions.md` Conventions and CONTRIBUTING.md agree on whether commits are signed off (owner decision if needed)
- [x] Coordinator commits follow it, or the DCO job exempts the history before the remote exists, documented

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] Release a patch version of each changed module

## Progress

Owner answered Q12 with B: DCO sign-off is required on every commit; the existing history gets sign-offs in the git history rewrite at the first push (with removing profiles-data-orca's vendored data, Q21), which waits until push time.

Changed (docs and a comment only): `.ai/instructions.md` Conventions now has a DCO bullet (required on every commit; not required until the rewrite, which adds them). `CONTRIBUTING.md` Sign-off section states the same (history unsigned until the rewrite, check applies from it onwards). `vsslicer/scripts/check-dco.mjs` header comment says it applies from the rewrite onwards; no behaviour change.

Verified: `cd vsslicer/scripts && node --test test/` 111 pass, 0 fail. No failing test written (documentation reconciliation, no behaviour change). "Release a patch version" does not apply: no module changed, only scripts/docs.

**Review passed (sp9-rev-plt-181)** Read the diff of `.ai/instructions.md` (Conventions, new DCO bullet), `CONTRIBUTING.md:120-128` (Sign-off section) and `vsslicer/scripts/check-dco.mjs:4` (comment only; no code change), plus SP2 audit finding 4 and PRF-190 (Q21). Both documents state Q12=B the same way: sign-off required on every commit, existing history unsigned and signed off by the history rewrite at first push (together with the Q21 removal of profiles-data-orca's vendored data, matching PRF-190), check applies from the rewrite onwards. No contradiction with the no-AI-trailers rule (`Signed-off-by` is the author's DCO trailer, not AI attribution) or with "only the coordinator commits" / "push only when asked". `.github/workflows/ci.yml` dco job runs on pull requests only, so it cannot fire before the remote exists; consistent with the docs. Ran `cd vsslicer/scripts && node --test test/`: 111 pass, 0 fail. No test to break (docs/comment only), no fixes made. Advisory, not blocking: no card yet tracks the first-push history rewrite (sign-off + Q21 data removal); the coordinator may want one so it is not forgotten at push time.
