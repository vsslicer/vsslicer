---
id: 5
title: "Define engine discovery, install and the pinned-release manifest schema"
type: feature
priority: P0
effort: S
model: sonnet
area: [engine]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [2]
created: 2026-10-25
---

Types shared by every adapter that detects or downloads an engine: `EngineInstall {id, version, path, source}`, `EngineLocator`, `EngineProvisioner`, and a JSON Schema for the pinned-release manifest (version, per-OS URL, size, SHA-256).

**Code:** `vsslicer/modules/slicer-api/src/domain/...` (module: `slicer-api`, layer: `domain`)

## Acceptance criteria

- [x] A manifest missing a SHA-256 for any OS fails schema validation (test)
- [x] `EngineInstall.source` is one of `user-setting | detected | downloaded`
- [x] Types and schema are exported and documented

## Tasks

- [x] Types
- [x] Manifest JSON Schema and validator
- [x] Tests

## Progress



small-cards-worker: added src/domain/engine-install.ts (EngineInstall, EngineLocator, EngineProvisioner, EngineManifest, ENGINE_MANIFEST_SCHEMA, hand-written validateEngineManifest/parseEngineManifest, no deps) and test/engine-install.test.ts. Bounds: 64 KiB text, 16 platforms, 512-char strings, size <= 4 GiB, https only, fixed-length hex SHA-256. Hostile tests included. 18 tests, lint, build, checks pass. index.ts: no change (re-exports domain). CHANGELOG Unreleased: Engine install types and pinned-release manifest schema with validator.

Review (sp8-reviewer-26, 2026-10-26 08:38): FAIL
1. vsslicer/modules/slicer-api/src/domain/engine-install.ts:93-107: the validator and the exported ENGINE_MANIFEST_SCHEMA disagree. The schema has additionalProperties:false at the top and per release; the validator accepts unknown keys (probe: `extra:1` at top, `evil:1` in a release, and a top-level `"__proto__":{...}` all return ok:true) and returns the input object with them. Fix: reject keys outside the known set at both levels, and add a test that schema and validator agree on the same samples.
2. engine-install.ts:85: `startsWith('https://')` is not URL validation. Probe accepts `"https:// evil com\n"` and `https://u:p@evil.com/x`. Fix: `new URL(s)` in try/catch, require protocol 'https:', a non-empty hostname, and empty username/password; tests for each.
3. engine-install.ts:42,111: `maxBytes` is compared with `text.length` (UTF-16 units), so 60000 '€' (180 KB UTF-8) passes. Bounded anyway; rename to maxChars or say so in the comment.
Passed probes: 64 KiB bound is checked before JSON.parse; validator is flat (no recursion); 64 KiB of '[' fails fast; uppercase and 63-char SHA-256, size 0, -1, 1.5, 2^53 rejected; 1000 platforms rejected; `https:evil` rejected; domain layer pure. Missing-SHA AC and ENGINE_SOURCES AC hold.
Ran: pnpm test (18 pass), lint, build, checks (pass), scratch probe.

SLC-5-115-fix: fixed review FAIL. Validator rejects unknown keys at top level and in releases (own __proto__ included); URL checked via new URL (https:, hostname, no userinfo); maxBytes renamed maxChars (UTF-16 units, commented). Tests: schema/validator agreement samples, hostile URLs. slicer-api 24 tests, lint, build, checks pass. Files: src/domain/engine-install.ts, test/engine-install.test.ts. No coordinator lines.

Review (sp8-reviewer-27, 2026-10-26 08:43): FAIL
Re-review after SLC-5-115-fix. Ran: pnpm test, pnpm lint, pnpm build in the module; `node scripts/run.mjs checks` (exit 0); scratch probe. slicer-api 24 tests pass.
- 1 fixed: unknown keys rejected at top and in releases, including own `__proto__` at both levels and `constructor`.
- 2 mostly fixed: `https:// evil com\n`, `https://u:p@...`, `https://u@...`, `https://`, `http:`, `file:` rejected.
- 3 fixed: `maxChars` with a UTF-16 comment (engine-install.ts:42-43); 66000 '€' rejected as too large.
1. Regression, and schema and validator disagree again (round-1 finding 1): `isHttpsUrl` (engine-install.ts:85-92) uses `new URL` only, which normalises `https:evil` to `https://evil/` and `HTTPS://E.COM/x` to https, so both now return ok:true; the previous review listed `https:evil` as rejected, and ENGINE_MANIFEST_SCHEMA's `pattern: '^https://'` (line 69) rejects both. Fix: also require `s.startsWith('https://')` in isHttpsUrl, and add `https:evil` and `HTTPS://e.com/x` to the schema/validator agreement samples.

Review (sp8-reviewer-28, 08:50): PASS. Fix by worker (recorded here, board note did not reach card): isHttpsUrl in src/domain/engine-install.ts:86-94 now requires s.startsWith("https://") plus URL protocol https, non-empty host, no userinfo, so "https:evil" and "HTTPS://E.COM/x" are rejected and "https://e.com/x" accepted; test/engine-install.test.ts:79-105 agree() now applies the schema url pattern via RegExp and compares to the validator, with samples 2 and 3 being those URLs, so it fails on disagreement. pnpm test (26), lint, build green.
