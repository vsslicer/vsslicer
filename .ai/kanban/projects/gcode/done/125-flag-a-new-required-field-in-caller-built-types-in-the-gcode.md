---
id: 125
title: Flag a new required field in caller-built types in the gcode-preview API gate
type: bug
priority: P2
effort: S
model: opus
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 13 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Not started.

2026-10-26 (sp12-gcp-125): done, gcode-preview, tooling (`etc/`).

- `vsslicer/modules/gcode-preview/etc/check-api.ts`: `breakingLines` now also returns added lines that are
  required members (no `?`, comments skipped, `readonly` allowed) inside `export interface PrintPosition` or
  `OpenOptions` (the `CALLER_BUILT` set, the audit's simplest form). Error text now says "removed, changed or newly
  required".
- `vsslicer/modules/gcode-preview/test/api-check.test.ts`: one new test: a required (and a `readonly` required)
  member added to `OpenOptions` fails; optional, `readonly` optional and `// (undocumented)` lines pass; a required
  member added to `GcodePreviewApi` (built by this extension) stays additive; an unchanged required member is not
  flagged.
- Sanity run on the real `etc/gcode-preview.api.md` (CRLF): unchanged report gives `[]`; `plate2: number;` in
  `OpenOptions` and `z2: number;` in `PrintPosition` each give one problem; a new `reset(): void;` on
  `GcodePreviewApi` gives `[]`.
- Bounds: the audit names no limits for this input. The input is this repository's own generated API report, read
  in one linear pass with `Set` lookups; the one regex on input lines is anchored and has no nested quantifier, so
  no backtracking. No caller-passed numbers. No new object keyed on input.
- Mutation probes (scratch copy, `node --test`), criterion by criterion:
  - Fix: drop `...addedRequired(...)` from `breakingLines`: 1 fail.
  - Optional skip removed: 1 fail. `readonly` group removed from the optional regex: 1 fail. Comment skip removed:
    1 fail. Caller-built filter removed (every interface): 1 fail. `had` check removed (flag unchanged members): 1
    fail.
  - Bounds: no new bound added, so nothing to probe.
- Verification (macOS, the CI gate in `.github/workflows/ci.yml` runs on ubuntu-latest, macos-latest and windows-latest): `pnpm install`, `pnpm lint`
  pass; `pnpm build` ok; `pnpm test` 118/118 pass; `node scripts/run.mjs checks` exit 0.

Release lines:

- CHANGELOG (gcode-preview, Fixed): `api:check --base` now counts a new required member of `PrintPosition` or
  `OpenOptions` (types other extensions build) as a breaking change (GCP-125, SP11 audit finding 13).
- No export changes.

**Review failed (sp12-rev-gcp-125)**

Ran (macOS): `pnpm install`, `pnpm lint`, `pnpm build` ok; `pnpm test` 118/118 pass; `node scripts/run.mjs checks`
exit 1, but only on `check-licence` for `modules/3mf/src/adapters/bambu/readPlates.ts:15` (another card's file, not
this one); the runner's own 84 tests pass. Mutation probes in a `mktemp -d` copy confirm the new test fails when
`...addedRequired(...)` is dropped, when the caller-built filter becomes `inside = true`, and when the `readonly` group
leaves the optional regex (1 fail each). Probes against the real CRLF `etc/gcode-preview.api.md`: unchanged `[]`;
`plate: number;` added to `PrintPosition` gives 1; `cb?(): void;` in `OpenOptions` gives 0. No input-keyed object
(the `Set`s hold whole lines, so `__proto__: number;` is flagged as usual, 1).

1. **A new required member is missed when the same line exists anywhere else in the old report.**
   `etc/check-api.ts:18` builds `had` from every line of the old report, and `:26` skips an added line found there.
   Probe: add `    move: number;` to `PrintPosition` (the line already exists in `ResolvedPosition`, report line 61) or
   `    by: ResolvedBy;` to `OpenOptions`: `apiProblems` returns `[]` for both, so CI passes a change that breaks every
   caller. Rule: "already there" must mean already in the same interface. Key the old lines by interface (for example
   collect `name + '\0' + line` while walking the old report with the same `inside` tracking) and compare against
   that. Add a test row where the added required member's text appears in another interface of the old report
   (`test/api-check.test.ts:21` only uses a name no other interface has, so it cannot catch this).

Minor, not blocking (fails closed): an added optional member with a multi-line object type
(`view?: {` / `a: number;` / `};`) is flagged, because the inner lines are read as members. One line comment on the
limit is enough if it stays.

2026-10-26 (sp12-gcp-125b): rework of review finding 1.

- `etc/check-api.ts`: new `callerBuiltLines` walks a report and returns `[interface, line]` for the body lines of
  `PrintPosition` and `OpenOptions`; `addedRequired` keys the old report's lines as `interface + '\0' + line`, so a
  member is "already there" only if it was in the same interface. The multi-line object type limit (fails closed)
  now has a one-line `shortcut:` comment.
- `test/api-check.test.ts`: the caller-built test gains two rows: `speed: number;` (already in `GcodePreviewApi`)
  and `keep: number;` (already in `OpenOptions`) added to `PrintPosition` each fail.
- Real CRLF `etc/gcode-preview.api.md` probes: unchanged 0; `move: number;` in `PrintPosition` 1 (was 0);
  `by: ResolvedBy;` in `OpenOptions` 1 (was 0); `cb?(): void;` in `OpenOptions` 0; `reset(): void;` on
  `GcodePreviewApi` 0.
- Mutation probe (scratch copy): `had` back to every old line and `had.has(l)`: 1 fail (the new rows). Earlier
  probes for the fix and its guards still apply (same filter conditions).
- Bounds: unchanged; one linear pass per report, `Set` of strings, anchored regex without nested quantifiers.
- Verification (macOS; CI gate runs on ubuntu-latest, macos-latest, windows-latest): `pnpm install`, `pnpm lint`,
  `pnpm build` ok; `pnpm test` 118/118 pass; `node scripts/run.mjs checks` exit 0.
- Release lines: unchanged from above.

**Review passed (sp12-rev2-gcp-125)**

Checked the rework against review finding 1 (sp12-rev-gcp-125). Ran (macOS) in `modules/gcode-preview`: `pnpm install`,
`pnpm lint`, `pnpm build` ok; `pnpm test` 118/118 pass; `cd vsslicer && node scripts/run.mjs checks` exit 0.

- Finding 1 fixed: `etc/check-api.ts:32` keys the old report's lines as `interface\0line`, so "already there" means the
  same interface. Probes on the real CRLF `etc/gcode-preview.api.md`: unchanged 0; `move: number;` in `PrintPosition` 1
  (line exists in `ResolvedPosition`); `by: ResolvedBy;` in `OpenOptions` 1; `line: number;` in `OpenOptions` 1;
  `cb?(): void;` in `OpenOptions` 0; `reset(): void;` on `GcodePreviewApi` 0.
- Hostile keys: `__proto__: number;` and `constructor: number;` in `PrintPosition` give 1 each (whole-line `Set`
  strings, no input-keyed object).
- Mutation probes (`mktemp -d` copy, `node --test test/api-check.test.ts`): key by line only (the old bug) 1 fail;
  drop `...addedRequired(...)` 1 fail; every interface treated as caller-built 1 fail; `readonly` group dropped 1
  fail; comment skip dropped 1 fail.
- Bounds: the audit names none; one linear pass per report, anchored regexes without nested quantifiers. Agreed.
- Layering: `etc/` tooling script, no cross-module imports.

Minor, not blocking (both fail closed, i.e. a false "breaking" report, never a missed break):
- Removing the `}` close tracking (`etc/check-api.ts:23`) passes the tests: no test row puts a new line after a
  caller-built interface's closing brace. A regression there would flag additive top-level exports after `OpenOptions`.
- A quoted optional key (`"a-b"?: number;`) is flagged as required; api-extractor rarely emits one.

The `test/integration/preview.test.ts` diff in this module belongs to another card (GCP-124), not reviewed here.
The CHANGELOG line under "Release lines" is not in `CHANGELOG.md` yet (coordinator's shared-file line).
