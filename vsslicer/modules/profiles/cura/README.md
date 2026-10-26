# @vsslicer/profiles-cura

Cura definitions and quality profiles (.def.json, .inst.cfg) to and from the shared profile model.

Status: scaffold, version 0.0.0. It will depend on `@vsslicer/profile-api` only, never on `profiles` or a
sibling adapter; that dependency is not declared yet because `profile-api` is unreleased (0.0.0) until PRF-135.

Layers (`src/`): `domain` (pure), `application` (use cases and ports). Add `adapters` and `presentation` when
needed. Imports point inward only (enforced by `@vsslicer/tooling`'s lint).
