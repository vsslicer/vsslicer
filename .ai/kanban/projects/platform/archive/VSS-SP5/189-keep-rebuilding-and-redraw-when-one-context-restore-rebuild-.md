---
id: 189
title: Keep rebuilding and redraw when one context-restore rebuild throws
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: webview-kit (gl). Finding 5 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] A throwing rebuild after webglcontextrestored does not skip the other rebuilds or onRestored, and the error is reported (test)

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Done. Each rebuild in the restore handler is wrapped in try/catch, the loop always finishes, and the first error goes to `onRestored(error?)` (optional parameter, so existing callers are unaffected). The Map-iteration comment now says the loop iterates a snapshot.

Fix round: review found a throwing rebuild left `e.free` as the lost context's free function. The catch now sets `e.free = undefined`. New test: after a failed restore, `remove()` and `dispose()` do not call the old free.

Verified in vsslicer/modules/webview-kit: `pnpm lint` clean, `pnpm test` 12 files / 121 tests pass (count includes another lane's tests). `test:browser` not run.

CHANGELOG: - Changed: `trackContextLoss` keeps rebuilding when one entry throws, drops that entry's stale free, and passes the first error to `onRestored(error?)`.

Review (plt189-rereview): PASS, stale free cleared in catch and tested (remove/dispose do not call old free; test fails without the fix by inspection), loop finishes and first error reaches onRestored, lint/test (121)/build clean, Playwright context-loss spec passes.

Files: vsslicer/modules/webview-kit/src/gl/context-loss.ts, vsslicer/modules/webview-kit/test/context-loss.test.ts
