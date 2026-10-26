---
id: 138
title: "Release `profiles-orca@0.1.0`: Orca and Bambu Studio import including the H2C variants"
type: chore
priority: P0
effort: XS
model: sonnet
area: [importers]
story: US12
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [27, 28, 29, 126, 124, 90, 128]
created: 2026-10-25
---

Publishes `profiles-orca@0.1.0` to the local registry so dependent modules can consume Orca and Bambu Studio import including the H2C variants.

**Code:** `vsslicer/modules/profiles-orca/` (module: `profiles-orca`, layer: n/a (release))

## Acceptance criteria

- [x] CHANGELOG entry and version bump to 0.1.0; `pnpm test && pnpm build` pass alone inside the module
- [x] `node scripts/run.mjs publish` publishes `@vsslicer/profiles-orca@0.1.0` to the local registry and a scratch project installs it from there
- [x] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [x] Write the changelog and bump the version
- [x] Run `run.mjs publish`
- [x] Install in a scratch project

## Progress

Not started.

**Released (sp12-coordinator):** version 0.1.0 and the CHANGELOG heading; `pnpm test` 212/212 and `pnpm build` alone in the module; `node scripts/run.mjs publish` published `@vsslicer/profiles-orca@0.1.0` to http://localhost:4873; a scratch project (`@vsslicer:registry` scoped to the local registry) installed it and imported `readOrcaTree`, `splitOrcaPrinters`, `importOrcaBundle`, `importBambuBundle`, `readOrcaInstances`, `exportOrcaBundle`, `exportBambuBundle` (44 exports). The release also carries SP12's bundle export (PRF-107, PRF-109), one version per sprint (rule 21).
