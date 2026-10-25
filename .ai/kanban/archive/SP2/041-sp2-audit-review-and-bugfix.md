---
id: 41
title: "SP2: audit review and bugfix"
type: chore
priority: P0
effort: S
model: opus
milestone: M1
sprint: SP2
owner: sp2
created: 2026-10-25
---

End-of-sprint audit for SP2, steps 2 and 3 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [x] `.ai/audits/SP2-audit.md` exists, written by an Opus agent that wrote none of SP2's code, over the modules SP2 changed
- [x] Every finding is a `type: bug` card in SP3 on its module's board (P0 must fix, P1 should fix, P2 nice to have), linking the report
- [x] The report ends with a "Cards" section listing those tickets

## Tasks

- [x] Run the audit once the sprint's task cards are done
- [x] Write the bugfix cards
- [x] List them in the report and in Progress

## Progress

The mid-sprint audit's findings were fixed in SP2: GCP-76, GCP-77, GCP-78, PLT-176, PLT-177, PLT-178 (each with a test that failed before the fix). The end-of-sprint audit (`.ai/audits/SP2-audit.md`, fresh Opus agent, no code changed) confirms those fixes hold and found 10 new issues, carded in SP3:

- Finding 1 (P0): PLT-179: Make a clean registry rebuild the repo: pin every lockfile to current @vsslicer versions
- Finding 2 (P1): GCP-80: Make the 100 MB summary test and the worker corpus test robust under load
- Finding 3 (P1): PLT-180: Add a prepack build to every module that ships dist
- Finding 4 (P1): PLT-181: Reconcile the DCO requirement with the project commit convention
- Finding 5 (P1): GCP-81: Fill holes in the summary extruders array
- Finding 6 (P1): PLT-182: Run test:integration in CI and drop the dead caches
- Finding 7 (P2): PLT-183: Print one-line errors from third-party-notices and vsslicer-bundle
- Finding 8 (P2): PLT-184: Write the bundle metafile relative to the bundle cwd
- Finding 9 (P2): PLT-185: Retry the lockfile-integrity registry fetch
- Finding 10 (P2): PLT-186: Build the test-vscode runner path with fileURLToPath
