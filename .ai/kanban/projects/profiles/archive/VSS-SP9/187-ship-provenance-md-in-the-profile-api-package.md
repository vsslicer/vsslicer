---
id: 187
title: Ship PROVENANCE.md in the profile-api package
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP9"
docs: [.ai/audits/SP8-audit.md]
created: 2026-10-26
---

Finding 5 of the SP8 audit (`.ai/audits/SP8-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] `profile-api/package.json` `files` lists `PROVENANCE.md` (the coordinator edits package.json; the worker writes the test)
- [x] A test reads `package.json` `files` and fails when `PROVENANCE.md`, `LICENSE` or `dist` is missing; `pnpm pack --dry-run` (or `npm pack --dry-run --json`) output lists PROVENANCE.md, recorded in Progress
- [x] The Cura LGPL text is not added (Q20 decides it)

## Progress

Wrote `test/package-files.test.ts`; it fails until the coordinator edits package.json (expected).

- The test reads package.json `files` and asserts it lists `dist`, `LICENSE` and `PROVENANCE.md`, and that `LICENSE` and `PROVENANCE.md` exist in the module. Currently 1 failure: `package.json "files" lists PROVENANCE.md`; the rest of the suite passes (722 of 723).
- Coordinator edit needed in `vsslicer/modules/profile-api/package.json`: add `"PROVENANCE.md"` to `files` (after `"LICENSE"`), e.g. `"files": ["dist", "LICENSE", "PROVENANCE.md", "README.md"]`. Suggested CHANGELOG line: "PROVENANCE.md is now published with the package."
- Pack check done on a scratch copy of package.json (real one untouched, scratch dir from mktemp): `npm pack --dry-run --json` listed LICENSE, PROVENANCE.md, README.md, package.json and dist/*. Not run against the real package.json for the reason above; rerun after the edit.
- The Cura LGPL text was not added.

**Review passed (sp9-rev-prf-186)**

The coordinator's edit to package.json `files` is in place. Run in the real module, `pnpm pack --dry-run` lists LICENSE, PROVENANCE.md and README.md. `pnpm lint` is clean, `pnpm build` ok and `node scripts/run.mjs checks` exits 0. The full `pnpm test` had 2 unrelated timeouts (see PRF-186). `test/package-files.test.ts` passes 5/5. Mutation checks in a `mktemp -d` copy: removing `PROVENANCE.md` from `files` fails "package.json files lists PROVENANCE.md", and removing the file fails "PROVENANCE.md exists in the module". No Cura LGPL text was added. No fixes made.
