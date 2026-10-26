# @vsslicer/printer-prusalink

PrusaLink printer connector.

Status: scaffold, version 0.0.0. It will implement the printer port from `@vsslicer/printer-api`; that dependency is not declared yet because `printer-api` is unreleased (0.0.0).

Layers (`src/`): `domain` (pure), `application` (use cases and ports). Add `adapters` and `presentation` when needed. Imports point inward only (enforced by `@vsslicer/tooling`'s lint).
