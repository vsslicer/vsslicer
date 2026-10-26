---
id: 188
title: Check exporter output paths in the profile-api port contract
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP9"
docs: [.ai/audits/SP8-audit.md]
created: 2026-10-26
---

Finding 9 of the SP8 audit (`.ai/audits/SP8-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The exporter contract (`profile-api/src/application/ports/contract.ts:L65`) rejects an output file whose `path` is absolute, has a `..` segment, a backslash, a drive letter or a NUL, reusing the unsafe-path check in `src/domain/bundle/bundle.ts` (no second copy)
- [x] The contract suite has a hostile-path case for each form, and a safe nested path still passes
- [x] **Bounds:** the path check is linear in the path length; paths over the bundle module's existing length cap are refused

## Progress

The exporter contract now rejects unsafe output paths.

- `src/domain/bundle/bundle.ts`: `unsafePath` is now exported (and from `src/domain/bundle/index.ts`; not from the package `src/index.ts`). No second copy.
- `src/application/ports/contract.ts` `exportProblems`: a file whose path contains a backslash or fails `unsafePath` (absolute, `..`/empty/dot segments, drive letter, NUL, over `BUNDLE_LIMITS.maxPathLength` = 512) reports `file N has an unsafe path "<first 64 chars>"`. The only addition outside the shared check is the any-position backslash test (`unsafePath` only refuses a leading backslash and dot segments split on it).
- `test/ports.test.ts`: a safe nested path passes; one case each for absolute, absolute backslash, `a/../b`, `../b`, inner backslash, drive letter, NUL and 513 characters.
- Bounds: the check is `unsafePath` (documented linear: one split, single-class regexes) plus one `includes`; the length cap is checked first, so an oversized path is refused before it is split. The message slices the path to 64 characters.
- Verified: `pnpm test` 718 passed (9 new), eslint (layer rule) clean, `pnpm build` ok, prettier on changed files, `node scripts/run.mjs checks` clean.
- Not done: no CHANGELOG line (shared file). Suggested line: "Exporter contract refuses output paths that are absolute, contain `..`, a backslash, a drive letter or NUL, or exceed 512 characters."

**Review passed (sp9-rev-prf-186)**

Ran `pnpm test` (`ports.test.ts` 20/20; the 2 unrelated timeouts are recorded on PRF-186), `pnpm lint` clean, `pnpm build` ok, `node scripts/run.mjs checks` exit 0. The contract reuses `unsafePath` from `domain/bundle`, so there is no second copy, and application importing domain is an inward dependency. Mutation checks in a `mktemp -d` copy: dropping `unsafePath` fails 6 hostile cases, and dropping the backslash `includes` fails the inner-backslash case.

Hostile-path probe through `runExporterContract`:
- Refused: `a/./b`, `a//b`, `a/`, `.`, `..`, `...`, ` /etc/passwd`, `.. /x`, `a/.. /b`, `//srv/share`, `c:/x`, `C:`, `\\?\C:\x`, `a\..\b`, NUL, `file:///etc/x`, and 513 characters.
- Accepted: 512 characters (the cap), `printer/x.json`.
- Linear: a 1e7-character path is refused in 2 ms, because the cap is checked first.

Accepted, but outside the criteria and the same as the bundle check: an NTFS stream suffix `x.json:ads`, Windows reserved names `CON` and `NUL.json`, and control characters such as `\n`. A possible follow-up card if exporters ever write on Windows hosts. No fixes made.
