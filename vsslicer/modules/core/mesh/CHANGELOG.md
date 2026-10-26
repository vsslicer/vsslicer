# Changelog

## Unreleased

- VWR-40: `parseAsciiStl` (streaming ASCII STL, CRLF and odd whitespace) and `MalformedMeshError`.
- VWR-41: `parseObj` (streaming OBJ geometry: n-gon fans, negative indices, groups and objects as parts).
- VWR-39: `parseBinaryStl` (streaming binary STL with guard rails) and `isBinaryStl`.
- VWR-35: STL and OBJ fixture corpus (`test/fixtures/stl-obj`) with generator and oracle scripts.
- VWR-46: `buildBvh`, `serialiseBvh`, `deserialiseBvh` (three-mesh-bvh 0.9.16, indirect, transferable buffers).
- VWR-34: module scaffold: layers `domain`, `application`, `adapters`.
- VWR-38: `IndexedMesh`, `MeshPart`, `BoundingBox`, `MeshStats` and typed `MeshError`s (truncated, count mismatch, non-finite, OBJ index out of range, file too large), each with a user message.
- VWR-42: `weld` (triangle soup to indexed mesh) and `fromArrays` (validating wrap of typed arrays).
- VWR-43: `computeStats`: bounds, signed volume, open and non-manifold edges, degenerate triangles.
