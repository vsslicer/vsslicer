---
id: 54
title: Add the api-extractor semver check to CI
type: chore
priority: P1
effort: S
model: sonnet
area: [live]
story: US17
milestone: "VSS:M1"
sprint: "VSS:SP11"
depends_on: [50]
created: 2026-10-25
---

A breaking API change must fail without a major bump. Needs PLT CI.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [x] api-extractor report is checked in; a breaking change fails CI without a major version bump (demonstrated by a test change)

## Tasks

- [x] Configure api-extractor
- [x] CI step

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: depends on GCP-50 (moved to SP6), and its CI criterion waits on Q7.

### SP11 worker sp11-gcp-54

- Added `@microsoft/api-extractor@7.59.4` (dev), `api-extractor.json`, `tsconfig.api.json` (declarations of `src/presentation/commands.ts`, the public contract, into `.cache/api-dts`), report `etc/gcode-preview.api.md` (checked in), `etc/check-api.ts` (`pnpm api:check [--base <ref>]`, `pnpm api:update`), `test/api-check.test.ts`, `.prettierignore` and eslint ignore for generated files, and a Linux-only step in `.github/workflows/ci.yml` (runs when gcode-preview is selected, `--base` = the select job's base).
- Rule: the report must equal the source (any API change is a visible report diff); against the base ref, a removed or changed report line (breaking) fails unless `GCODE_PREVIEW_API_VERSION` (the contract's major) was raised. Additive changes pass. The package version is not the gate: the extension's public contract is that constant (D20).
- Demonstration: changing `stopFollow(uri: UriArg)` to `(uri: string)` in commands.ts made `pnpm api:check` fail ("You have changed the API signature"); restored. Unit tests cover additive pass, removed/changed fail, bumped pass.
- Mutation probe: replacing `!kept.has(l)` with `false` in `breakingLines` -> test fails (1 fail); restored. Version-bump guard (`after <= before`) is covered by the third test.
- Verified: gcode-preview lint ok, build ok, test 111 pass 0 fail, `run.mjs checks` ok. CI gate runs on ubuntu-latest.
- Release lines: CHANGELOG: "Add the api-extractor report (etc/gcode-preview.api.md) and `pnpm api:check`, which fails CI on API drift and on a breaking change without a higher GCODE_PREVIEW_API_VERSION." Needs the module's package.json and lockfile (already changed by me: devDependency, scripts `api:check`, `api:update`). No src/index.ts exports.

**Review passed (sp11-rev-gcp-54)**

- Ran in vsslicer/modules/gcode-preview: `pnpm install` ok, `pnpm lint` ok (eslint, prettier, tsc), `pnpm build` ok, `pnpm test` 111 pass 0 fail, `pnpm api:check --base HEAD` ok (no report at HEAD yet, so nothing to compare; the report matches the source). `node scripts/run.mjs checks` exit 0.
- End to end in a `mktemp -d` git copy of the module, base commit = the current tree: (A) `stopFollow(uri: UriArg)` changed to `(uri: string)` with no report update: fails (api-extractor reports a changed signature). (B) same change after `api:update`, `--base HEAD`: fails with "breaking API change without raising GCODE_PREVIEW_API_VERSION (1)". (C) the same change plus `GCODE_PREVIEW_API_VERSION = 2`: passes. (D) adding an optional `ping?(): void` member: fails until `api:update` is run, then passes against the base. The acceptance criterion holds.
- Mutation probes on test/api-check.test.ts: `after <= before` changed to `true`: 1 fail; `!kept.has(l)` changed to `false`: 1 fail; both restored (cmp ok). Dropping `!VERSION.test(l) &&` does not fail a test, but the tests change the version line together with a member line, so that exclusion cannot be seen from them. Not blocking.
- CI step: Linux only, runs when gcode-preview is selected, `--base` is the select job's base. The test job checks out with `fetch-depth: 0`, so `git show <base>:./etc/...` resolves. When the base is the empty-tree fallback or has no report, the step says "nothing to compare" and passes, which is right on first introduction.
- Layering: tooling script lives in etc/, src is untouched, no imports across modules. `.cache` is git-ignored (vsslicer/.gitignore:7) and lint-ignored.
- Known limits for a later card (not blocking, outside this criterion as written): (1) etc/check-api.ts:14-17 compares sets of lines, so adding a *required* member to an input type (e.g. `OpenOptions`) counts as additive and passes, though callers would break. (2) A member line removed from one interface while an identical line remains in another is not flagged. The rule to apply: compare per declaration, and treat a new required member of a type that callers pass in as breaking.
- Release lines (coordinator): the CHANGELOG line the worker proposed is not yet in CHANGELOG.md.
