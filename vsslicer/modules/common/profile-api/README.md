# @vsslicer/profile-api

The shared profile model: entity types, settings values, schema, catalogue, pure condition and
merge code, and the ports adapters implement. It depends on no other VSSlicer module.

Layers (`src/`): `domain` (pure entities), `application` (use cases and ports). Imports point inward only
(enforced by `@vsslicer/tooling`'s lint).

Licence: the module's code is AGPL-3.0-or-later. The generated catalogue data (`src/domain/catalogue/data/`) is
ported from OrcaSlicer and Bambu Studio and is AGPL-3.0-only (version 3, no "or later"); see `PROVENANCE.md` for the
upstream commits. That data is moving to its own package, `@vsslicer/profile-catalogue-data` (AGPL-3.0-only), after
which this package depends on it and holds no AGPL-3.0-only material.
