---
id: 184
title: Write the bundle metafile relative to the bundle cwd
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP3"
docs: [.ai/audits/SP2-audit.md]
created: 2026-10-25
---

Module: tooling. Finding 8 of the SP2 audit, `.ai/audits/SP2-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] `bundle(entry, outfile, cwd)` writes the metafile under `cwd` (test first)

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] Release a patch version of each changed module

## Progress

Done in tooling (unreleased, coordinator releases). Tests in test/bundle.test.mjs and test/notices.test.mjs.
