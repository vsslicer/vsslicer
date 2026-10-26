---
id: 192
title: "Move profile-api's catalogue data into its own AGPL-3.0-only package"
type: feature
priority: P1
effort: L
model: opus
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [179]
created: 2026-10-26
---

Q20 (answered: "Separate data package"): profile-api ships catalogue data generated from OrcaSlicer and Bambu Studio (AGPL-3.0-only) under an AGPL-3.0-or-later package. Move the generated data and its generator into its own AGPL-3.0-only package so profile-api stays -or-later. Follows PRF-179's provenance work.

**Code:** new module `vsslicer/modules/profile-catalogue-data` (data + `tools/catalogue/`), and `vsslicer/modules/profile-api` (drops the data, reads it through a semver dependency) (layers: data package; profile-api `domain/catalogue` keeps the types)

## Acceptance criteria

- [x] New module `profile-catalogue-data`, `"license": "AGPL-3.0-only"`, `files` with `PROVENANCE.md` and both upstream licence texts; `pnpm install && pnpm test && pnpm build` works alone
- [x] The new package exports the same catalogue data and loader API profile-api uses today, so PRF-193 can switch profile-api to it (split at SP9 start, rule 17: this card creates the module, PRF-193 removes the data from profile-api)
- [x] PROVENANCE.md is copied to the new module (profile-api's copy goes in PRF-193)
- [x] **Bounds:** the data loader validates the JSON it reads (size cap per file 16 MiB, key count, depth 32) before use, with a hostile test
- [x] Release order in Progress: profile-catalogue-data 0.1.0 first, then profile-api minor, then dependants re-locked (rule 13)

## Progress

sp9-prf-192: created `vsslicer/modules/profile-catalogue-data` (version 0.0.0, `"license": "AGPL-3.0-only"`). profile-api untouched (PRF-193 removes its copy).

- `src/data/*.json`: copied unchanged from profile-api `src/domain/catalogue/data/` (orca, bambu, prusa, superslicer, cura, groups).
- `tools/catalogue/*.ts`: copied from profile-api; `../../src/index.ts` and `../../src/domain/catalogue/cura.ts` imports now `@vsslicer/profile-api` (devDependency `^0.1.1`, from the local registry); output paths point at `src/data/`. Upstream clone paths (`../../../../../.reference/repos`) are the same depth and unchanged. `keys.ts` still writes to its own `test/fixtures/catalogue-keys` (those fixtures are profile-api's test input; PRF-193 decides where that script lives).
- `src/load.ts`: `CATALOGUE_LIMITS` (16 MiB per file in UTF-8 bytes, 1,000,000 keys counting object keys and array elements, depth 32), `checkCatalogueJson(value, limits?)` (iterative walk, no recursion), `parseCatalogueJson(text, limits?)` (byte cap before `JSON.parse`), `CatalogueDataError`. Caller limits must be safe integers from 1 to the default (RangeError otherwise).
- `src/index.ts`: exports `orcaCatalogue`, `bambuCatalogue`, `prusaCatalogue`, `superslicerCatalogue`, `curaCatalogue`, `catalogueGroups`, each passed through `checkCatalogueJson` on load, typed `CatalogueJson` (loose object): profile-api keeps the types and casts, as it does today (`data as CatalogueFile`). The source does not import profile-api, so profile-api can depend on this package at runtime.
- PROVENANCE.md copied, paths changed to `src/data/`, intro says the package as a whole is AGPL-3.0-only. LICENSE (project, same as profile-api's), LICENSE-OrcaSlicer, LICENSE-BambuStudio copied from profiles-data-orca; all in `files`. Own package.json (prepack, tooling devDependency pattern from profiles-data-orca), lockfile, README, CHANGELOG, .npmrc, pnpm-workspace.yaml, tsconfig(.test).json (test config includes `tools`), vitest config, `.prettierignore` (`src/data`). eslint.config.mjs lets `tools/**` import devDependencies (the generator is dev-only and not in `files`).
- Tests: `test/load.test.ts` (each shipped file parses within the limits; exports match the files, 804 Orca entries; hostile: depth 32 passes / 33 fails, 200,000-deep array fails without stack overflow, key cap boundary, byte cap counts UTF-8 bytes, non-object and bad JSON, invalid limits 0/-1/1.5/NaN/Infinity/over-max) and `test/provenance.test.ts` copied from profile-api (imports generate.ts through the published profile-api).

Verified: `pnpm install` against the local registry, `pnpm test` 2 files / 25 tests pass, `pnpm lint` clean, `pnpm build` (dist has index, load and data/*.json). `node tools/catalogue/generate.ts` regenerates all six files byte-identical to profile-api's (cmp). `node scripts/run.mjs checks`: 82 runner tests pass; **check-licence fails** on this module: `modules/tooling/bin/check-licence.mjs:44` requires `"license": "AGPL-3.0-or-later"` for every module, with no exception. Not changed (tooling is its own module).

### Left / for the coordinator

1. check-licence (tooling, needs its own card or a line here): accept `AGPL-3.0-only` when the module has a `PROVENANCE.md` listed in `files`, e.g. replace `tooling/bin/check-licence.mjs:44-45` with:
   ```js
   const manifest = JSON.parse(readFileSync(pkg, 'utf8'));
   const dataOnly = manifest.license === 'AGPL-3.0-only' && manifest.files?.includes('PROVENANCE.md');
   if (manifest.license !== 'AGPL-3.0-or-later' && !dataOnly)
     fail(pkg, 'package-license', 'package.json must have "license": "AGPL-3.0-or-later" (or "AGPL-3.0-only" with PROVENANCE.md in files)');
   ```
   plus a tooling test and a tooling minor bump. profiles-data-orca would then switch to `AGPL-3.0-only` too.
2. Dependency cycle for PRF-193: `scripts/lib.mjs:41` orders modules by dependencies **and devDependencies** and throws on a cycle. Once profile-api depends on `@vsslicer/profile-catalogue-data`, this package's devDependency on `@vsslicer/profile-api` (for the generator's types) is a cycle. Options: the runner ignores devDependencies pinned to an already-published version, or PRF-193 moves the generator's type imports to a local copy of the few types, or the generator stays in profile-api. Decide before PRF-193.
3. Release order (rule 13): publish `profile-catalogue-data@0.1.0` first (CHANGELOG `## Unreleased` becomes `## 0.1.0`), then PRF-193 bumps profile-api minor (0.2.0) to depend on `^0.1.0` and drop its data, then re-lock profile-api's dependants (profiles-orca, profiles-cura, profiles-prusa and every other `@vsslicer/profile-api` consumer).
4. Not done: a CI job for the module (`.github/workflows`), if the runner does not pick up new modules automatically.

**Review failed (sp9-rev-prf-192)**

Ran in `vsslicer/modules/profile-catalogue-data`: `pnpm install` (local registry up), `pnpm test` 2 files / 25 tests pass, `pnpm build` ok (dist has index, load, data/*.json; `pnpm pack --dry-run` ships dist, LICENSE, LICENSE-OrcaSlicer, LICENSE-BambuStudio, PROVENANCE.md, README.md), **`pnpm lint` fails: 13 errors**. `cd vsslicer && node scripts/run.mjs checks`: exit 0, 82 runner tests pass, check-licence passes with PLT-197's working-tree tooling. The runner finds the module by `readdirSync(modules/)` (`scripts/run.mjs:27`) and CI runs `run.mjs ci --changed`, so no workflow edit is needed.

Checked and fine: `src/data/*.json` all six byte-identical (cmp) to `profile-api/src/domain/catalogue/data/`; `license: AGPL-3.0-only`; LICENSE same as profile-api's, LICENSE-OrcaSlicer/BambuStudio same as profiles-data-orca's (AGPL v3 texts), all in `files`; PROVENANCE.md differs from profile-api's only in paths and the -only sentence; no NOTICE needed (AGPL has no NOTICE requirement, upstreams ship none we copy). Generator imports profile-api only as `@vsslicer/profile-api` (`tools/catalogue/{generate,entry,prusa,groups,cura}.ts`); no relative imports into other modules (only `.reference/repos` upstream clone paths). Loader: mutation probes in a mktemp copy each fail the suite (depth check off: 2 fail; key cap off: 1; UTF-8 byte count off: 1; limit upper bound off: 1; safe-integer check off: 2). Hostile probes against dist: 3,000,001-element array -> key cap; 16 MiB+ string -> byte cap; sparse 2^31 array -> key cap; 200,000-deep array -> depth error, no stack overflow. No wall-time asserts.

Problem:
1. `eslint.config.mjs:1`, `src/index.ts:1`, `src/load.ts:1`, `test/*.ts:1`, `tools/catalogue/*.ts:1`, `vitest.config.ts:1`: `spdx/header` (from `@vsslicer/tooling/eslint`, `tooling/eslint.mjs:9`, hard-coded `AGPL-3.0-or-later`) rejects the `AGPL-3.0-only` headers that check-licence (PLT-197) now requires, so the module's `pnpm lint` (and `run.mjs ci`) fails. The two checks contradict each other. Expected fix: make tooling's `spdx/header` rule take the id from the package's `license` (tooling minor, published, this module re-locked), or, until that ships, override `'spdx/header': 'off'` in this module's `eslint.config.mjs` with a one-line comment that check-licence's `spdx-header` enforces the -only header. profiles-data-orca will hit the same when it switches to -only, so the tooling fix is the better one.

Dependency cycle (Left item 2), recommendation: change the runner (`scripts/lib.mjs` order) so a devDependency edge that would close a cycle is dropped from the build order (with a printed note), keeping the generator's devDependency on the published `@vsslicer/profile-api`. A devDependency on an already-published version needs nothing built first. Not a local copy of the types: `groups.ts` imports the runtime `GROUPS` too, and a copy would drift. Not the generator staying in profile-api: it would write into this module's `src/data/`, which is reaching into another module's files.

**Carried to SP10 (sp9-coordinator, 10:41):** its review failed on the ESLint spdx rule; PLT-197 fixed the rule, so it needs tooling 0.8.4 and a re-review. The unreviewed work is parked, untracked, under `.ai/local/wip/SP9/` at the same paths (vsslicer/modules/profile-catalogue-data/ (whole module)); move it back with `mv` before continuing. Nothing of it is committed.
