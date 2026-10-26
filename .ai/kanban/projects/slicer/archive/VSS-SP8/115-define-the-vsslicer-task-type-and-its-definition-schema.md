---
id: 115
title: Define the `vsslicer` task type and its definition schema
type: feature
priority: P1
effort: S
model: sonnet
area: [tasks]
story: US18
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [100]
created: 2026-10-25
---

`taskDefinitions` for `slice`, `upload` and `print` with typed properties, resolved from `tasks.json`.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [x] The schema validates sample `tasks.json` entries and rejects unknown properties
- [x] `slice` takes engine, plate and the profile triple; `upload`/`print` take a printer id
- [x] The schema is exported

## Tasks

- [x] package.json definitions
- [x] Resolution tests

## Progress



small-cards-worker: package.json contributes.taskDefinitions (one type `vsslicer`, `task` enum slice|upload|print, props engine/plate/printerProfile/filamentProfile/processProfile/printer). src/presentation/tasks.ts exports TASK_PROPERTIES and validateTaskEntry (rejects unknown props, kind-mismatched props, missing required; bounds 64 keys, 512-char strings). test/tasks.test.ts (4 tests, includes cross-check that package.json matches the code and hostile cases). 9 tests, lint, build, checks pass. No src/index.ts exists in this module. CHANGELOG Unreleased: The `vsslicer` task type (slice, upload, print) with definition schema and tasks.json validation.

Review (sp8-reviewer-26, 2026-10-26 08:38): FAIL
1. vsslicer/modules/slicer-extension/src/presentation/tasks.ts:19: GENERIC_KEYS lacks keys VS Code allows on every task: isBackground, promptOnClose, icon, hide, options, runOptions, dependsOrder, identifier (vscode@4ef6bab7:src/vs/workbench/contrib/tasks/common/jsonSchema_v2.ts:431-455). A valid entry such as `{type:'vsslicer',task:'print',printer:'x',isBackground:true}` or with `runOptions` is rejected as "unknown property". Fix: add them (cite that file in the comment) and test one entry using several.
Design: one `vsslicer` type with a `task` enum is fine; it matches vscode-platform.md:60 (slice/upload/print as tasks from one provider) and keeps one TaskDefinition identity. VS Code taskDefinitions cannot express per-kind required sets or additionalProperties, so the code validator carrying that is right. "Schema is exported": TASK_TYPE, TASK_KINDS, TASK_PROPERTIES and validateTaskEntry are exported and the test cross-checks package.json against them; acceptable. Editing package.json contributes is the card's own task, so not a rule-3 breach.
Ran: pnpm test (9 pass), lint, build, checks (pass). Skipped test:integration (needs a VS Code download).

SLC-5-115-fix: fixed review FAIL. GENERIC_KEYS now has isBackground, promptOnClose, icon, hide, options, runOptions, dependsOrder, identifier (cites jsonSchema_v2.ts:431-455 @4ef6bab7); new test uses several. slicer-extension 10 tests, lint, build, checks pass. Files: src/presentation/tasks.ts, test/tasks.test.ts. No coordinator lines.

Review (sp8-reviewer-27, 2026-10-26 08:43): FAIL
Re-review after SLC-5-115-fix. Ran: pnpm test, pnpm lint, pnpm build in the module; `node scripts/run.mjs checks` (exit 0); scratch probe. slicer-extension 10 tests pass.
- Round-1 finding fixed for the listed keys: an entry with isBackground, promptOnClose, icon, hide, options, runOptions, dependsOrder, identifier validates ok.
1. GENERIC_KEYS (src/presentation/tasks.ts:18-36) still misses `inAgents`, which the cited range has (vscode@4ef6bab7:src/vs/workbench/contrib/tasks/common/jsonSchema_v2.ts:446); probe `{type:'vsslicer',task:'print',printer:'x',inAgents:true}` returns "inAgents: unknown property for print", so the comment's claim is false. Fix: add 'inAgents' and include it in the test that uses several common keys. (Deprecated `taskName` at :426 is outside the range; leaving it out is fine.)

Review (sp8-reviewer-28, 08:50): PASS. Fix by worker (recorded here, board note did not reach card): inAgents added to GENERIC_KEYS at src/presentation/tasks.ts:36 and to the multi-key test at test/tasks.test.ts:60 (asserts ok). pnpm test (10 pass), lint, build green.
