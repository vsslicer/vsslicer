# Changelog

## Unreleased

- VWR-34: module scaffold: layers `domain`, `application`, `adapters`.
- VWR-38: `IndexedMesh`, `MeshPart`, `BoundingBox`, `MeshStats` and typed `MeshError`s (truncated, count mismatch, non-finite, OBJ index out of range, file too large), each with a user message.
- VWR-42: `weld` (triangle soup to indexed mesh) and `fromArrays` (validating wrap of typed arrays).
- VWR-43: `computeStats`: bounds, signed volume, open and non-manifold edges, degenerate triangles.
