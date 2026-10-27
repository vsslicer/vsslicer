---
id: 154
title: Check that two Linux builds are byte-identical
type: feature
priority: P1
effort: M
model: opus
area: [ci]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP18"
depends_on: [152]
created: 2026-10-25
---

Runs the Linux build twice from the same inputs and compares; differing files are listed and either fixed or explained.

**Code:** `.github/workflows/build.yml` (repo: `vsslicer/vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] A job builds twice and diffs the file trees; identical passes
- [ ] If files differ, `docs/reproducibility.md` lists each file and the reason, and an allow-list in the repo names them; a new difference fails the job
- [ ] Checked on CI runners only

## Tasks

- [ ] Write the double-build job
- [ ] Fix or allow-list the differences

## Progress

Not started.
