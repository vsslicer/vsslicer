# @vsslicer/profiles

Profile storage, import and export orchestration over the shared profile model.

Status: scaffold, version 0.0.0. It will depend on `@vsslicer/profile-api` only, never on the ecosystem
adapters (`profiles-prusa` and siblings, wired in by `profiles-extension`); the `profile-api` dependency is
not declared yet because `profile-api` is unreleased (0.0.0) until PRF-135.

Layers (`src/`): `domain` (pure), `application` (use cases and ports). Add `adapters` and `presentation` when
needed. Imports point inward only (enforced by `@vsslicer/tooling`'s lint).
