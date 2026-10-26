# @vsslicer/agent-protocol

Agent protocol: JSON-RPC messages and schemas.

Status: scaffold, version 0.0.0.

Layers (`src/`): `domain` (pure), `application` (use cases and ports). Add `adapters` and `presentation` when
needed. Imports point inward only (enforced by `@vsslicer/tooling`'s lint).
