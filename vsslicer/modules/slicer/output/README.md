# @vsslicer/slicer-output

Engine-independent sliced-output writing: thumbnail encoders, G-code thumbnail blocks and .gcode.3mf assembly.

Status: scaffold, version 0.0.0.

Layers (`src/`): `domain` (pure), `application` (use cases and ports). Add `adapters` and `presentation` when
needed. Imports point inward only (enforced by `@vsslicer/tooling`'s lint).
