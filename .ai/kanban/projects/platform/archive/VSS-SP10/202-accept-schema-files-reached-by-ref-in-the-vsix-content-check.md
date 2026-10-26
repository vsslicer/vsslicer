---
id: 202
title: Accept schema files reached by $ref in the VSIX content check
type: chore
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
created: 2026-10-26
---

From PRF-67 (SP10): `@vsslicer/tooling` `bin/vsslicer-package.mjs` accepts in a VSIX only files named by a string under `contributes` or `icon`, so `profiles-extension/schemas/defs.json` (the `$ref` target of every contributed schema, not itself contributed) fails the content check with `content: unexpected extension/schemas/defs.json`.

**Code:** `vsslicer/modules/tooling/bin/vsslicer-package.mjs`, `test/` (tooling)

## Acceptance criteria

- [x] The content check also accepts files reached by a relative `$ref` from a contributed JSON schema (resolved inside the extension folder; a `$ref` outside it, absolute, or to a missing file fails the check), or an explicit `vsslicer.packageAssets` list in package.json: pick the smaller one and say why
- [x] Tests: a fixture extension with a contributed schema that `$ref`s `./defs.json` packs; an unreferenced extra file still fails; a `$ref` escaping the folder fails; each fails with its rule removed
- [x] **Bounds:** `$ref` scanning reads only contributed schema files, caps their size and the number of refs, and does not follow refs transitively beyond a depth cap
- [ ] tooling patch release (0.8.5) and re-lock of profiles-extension by the coordinator (rule 13)

## Progress

Chose `$ref` scanning over a `vsslicer.packageAssets` list: nothing to keep in sync by hand, and the schema already says what it needs. `schemaRefs` in `bin/vsslicer-package.mjs` reads only `contributes.jsonValidation` files, follows relative `$ref` file parts iteratively (no recursion), caps: 1 MiB per file, 10000 refs per file, 64 files, depth 3. Absolute/scheme, missing, escaping (realpath) or non-file refs fail with `ref: ...`. Tests in `test/package.test.mjs` (3 new). Mutation probes, each fails a test: ref files not accepted, ref problems dropped, size cap, node cap, depth cap, escape check. CHANGELOG Unreleased line added; release 0.8.5 and re-lock left to the coordinator.
Check against profiles-extension: ran packAll with the working-tree tooling in that module; result `profiles-0.0.0.vsix` 22.1 KB, no problems (defs.json accepted); VSIX deleted, no module files changed by me.
Verification: tooling `pnpm test` 75 pass / 0 fail, lint and build pass.

**Review passed (sp10-coordinator, who wrote none of this code)**: tooling `pnpm lint` ok, `pnpm test` 75 pass 0 fail. Probes on `bin/vsslicer-package.mjs`, each restored (`cmp` clean): escape check `inside.startsWith('..')` removed (`:143`) fails 1; absolute-ref check removed (`:130`) fails 1. Containment uses `realpathSync` then `relative(root, real)`, so a symlinked ref target outside the extension is refused. The worker's profiles-extension pack (22.1 KB, no problems) stands. Minor: a file whose name starts with `..` (e.g. `..defs.json`) inside the folder is refused as escaping; harmless.
