---
id: 41
title: Test the 50 MB-plus file through the custom editor
type: chore
priority: P0
effort: M
model: sonnet
area: [editor]
story: US14
milestone: "VSS:M1"
sprint: "VSS:SP8"
depends_on: [18, 30]
created: 2026-10-25
---

Proves the host stays responsive.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [x] `@vscode/test-electron` opens a file over 50 MB; not a `TextDocument`; host thread never blocked over 100 ms (measured) -- measured, not asserted (rule 5): max event-loop delay 44.8 ms (mean 12.5, p99 26.2) on M1 Pro, Node 26, 51.4 MB file; test asserts only structural facts

## Tasks

- [ ] Generate file
- [ ] Event-loop lag probe
- [ ] Test

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: dependency-blocked in SP5 (rule 7): depends on GCP-18, whose CI step waits on Q7.

- Review (sp8-reviewer-16, 2026-10-26): PASS. integration (11 passing, 3 runs; 51.38 MB file; event-loop max 21.6-54.8 ms across runs, card records 44.8), unit, lint, build, checks (exit 0 on rerun; one earlier exit 1 was transient, other workers mid-edit). Generated into mkdtemp, removed in after() (mkdtemp is in before(), so it survives test failure); no leftover gcp-41 dirs, nothing large committed. The TextDocument assertion is real: onDidOpenTextDocument listener is registered before vscode.openWith and textDocuments is checked after; openTextDocument would fire it. No wall-time assertion (300 s hang guard only). Generator is ~25 lines, attributed to GCP-18 in a comment. Minor, not blocking: the card shows 44.8 ms but runs vary, which is fine as it is only recorded.
