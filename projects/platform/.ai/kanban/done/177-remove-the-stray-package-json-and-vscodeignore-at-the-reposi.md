---
id: 177
title: Remove the stray package.json and .vscodeignore at the repository root
type: bug
priority: P1
effort: XS
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-177-worker
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Untracked leftovers of `example-extension` 0.5.0 at the root break "all code lives in `vsslicer/`" (finding 5). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [x] Neither file exists at the root
- [x] No script or doc refers to them

## Tasks

- [x] Delete both files
- [x] Check nothing at the root writes them again

## Progress

Done. Deleted /package.json and /.vscodeignore (verbatim example-extension 0.5.0 copies, identical mtime 20:55:30 = one copy event). Writer search: `vsslicer-package` is not it. Its stage is `mkdtemp` in `os.tmpdir()`, the staged package.json is unscoped without `files` (the root file is scoped with `files`), and its only other write is `<name>.vsix` into cwd. No script, test, workflow or doc in vsslicer/, .github/ or CONTRIBUTING.md writes or names the files (grep). Likely a one-off manual/scratch copy during PLT-21/22. No tooling change, so no 0.8.2 bump or publish. Not done: a guard against recurrence (cause unknown). Notes: .reference/notes/PLT-177-stray-root-files.md.
