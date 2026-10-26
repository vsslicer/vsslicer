# @vsslicer/profile-catalogue-data

Data only: the generated settings catalogue `@vsslicer/profile-api` reads (`src/data/*.json`: Orca, Bambu,
Prusa, SuperSlicer, Cura, and the group report), and its generator (`tools/catalogue/`).

Licence: AGPL-3.0-only, because the data is ported from OrcaSlicer and Bambu Studio (AGPL-3.0-only); see
`PROVENANCE.md`. Kept apart so profile-api stays AGPL-3.0-or-later (Q20).

Exports `orcaCatalogue`, `bambuCatalogue`, `prusaCatalogue`, `superslicerCatalogue`, `curaCatalogue` and
`catalogueGroups` as plain JSON objects (profile-api owns the types and casts them), each checked on load by
`checkCatalogueJson`. `parseCatalogueJson(text, limits?)` parses other catalogue text within `CATALOGUE_LIMITS`
(16 MiB per file, 1,000,000 keys, depth 32); limits a caller passes must be whole numbers no larger than those.

Regenerate: `pnpm regenerate` (needs the upstream clones in `.reference/repos`; the generator imports profile-api's
types from the published `@vsslicer/profile-api`).
