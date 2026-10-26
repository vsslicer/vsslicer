---
id: 196
title: Add an extension-id override to the tooling VSIX packager
type: feature
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP9"
created: 2026-10-26
---

Q22 (answered: "Short ids via a tooling override"): the VSIX packager derives the extension id from the unscoped npm name, so `@vsslicer/printers-extension` packs as `vsslicer.printers-extension`. Add an optional override so ids stay short (`vsslicer.printers`, `vsslicer.slicer`, `vsslicer.project`).

**Code:** `vsslicer/modules/tooling/bin/vsslicer-package.mjs` and its test (module: `tooling`, layer: tooling bin)

## Acceptance criteria

- [x] An optional `"vsslicer": {"extensionName": "<name>"}` in a module's package.json sets the `name` written into the temporary packaging copy (and so the VSIX id `<publisher>.<name>` and file name); without it the current unscoped-name behaviour is unchanged
- [x] **Bounds:** the override is validated against vsce's rule for `name` (lowercase, `^[a-z0-9][a-z0-9-]*$`, at most 214 characters); anything else fails with a named error before vsce runs
- [x] Tests cover: no override, a valid override, an invalid one (uppercase, slash, empty, 215 characters, non-string)
- [x] Progress lists the one-line package.json change for printers-extension, slicer-extension and project-extension (coordinator applies them after the tooling patch release)

## Progress

Changed `bin/vsslicer-package.mjs`: new exported `extensionName(pkg)` (override `vsslicer.extensionName`, else unscoped npm name; validates `^[a-z0-9][a-z0-9-]*$`, max 214, string only, throws a named error). `pack()` calls it first (before vsce), uses it for the staged `name` and the VSIX file name. Repository tag check still uses `<module>@<version>`. Header comment updated. Tests added in `test/package.test.mjs` (default, valid, 9 invalid values, real pack showing id `short` and file `short-1.2.3.vsix`, invalid stops pack). `node --test test/package.test.mjs`: 13 pass; `pnpm lint` clean; `node scripts/run.mjs checks` clean.

Coordinator, after the tooling patch release, add to package.json `"vsslicer"` object:
- printers-extension: `"extensionName": "printers"`
- slicer-extension: `"extensionName": "slicer"`
- project-extension: `"extensionName": "project"`

Not done: no CHANGELOG/package.json edits (shared).

**Review passed (sp9-rev-plt-196)**: read `git diff HEAD` (bin/vsslicer-package.mjs, test/package.test.mjs) and the connected `checkManifest`/`pack`/`packAll`. In tooling: `pnpm test` 61/61 pass, `pnpm lint` clean, `pnpm build` clean; `node scripts/run.mjs checks` clean. Release tag and repository: `checkManifest` still builds the tag from `shortName(pkg)` on the original package.json and the staged copy keeps `repository` unchanged, so the override touches only the staged `name` and the VSIX file name; probe: with `extensionName: "printers"`, a repository at `printers-extension@1.0.0` passes and one at `printers@1.0.0` is rejected. `vsslicer` missing or `null` falls back to the unscoped name (`?.`). Mutants in a temp copy, each killed by the new tests: validation removed (2 fail), staged name back to shortName (1), file name back to shortName (1), tag built from the override (1), limit 214 to 213 (1). Hostile input: a 10M-character override throws with a 164-character message. No edits made.
