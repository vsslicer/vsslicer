# @vsslicer/profile-api

The shared profile model: entity types, settings values, schema, catalogue, pure condition and
merge code, and the ports adapters implement. It depends on no other VSSlicer module.

Layers (`src/`): `domain` (pure entities), `application` (use cases and ports). Imports point inward only
(enforced by `@vsslicer/tooling`'s lint).
