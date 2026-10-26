# Changelog

## Unreleased

- VWR-393: OBJ and ASCII STL parsers refuse files over the hard triangle cap while parsing, before welding.
- VWR-389: weld and computeStats use typed-array hash tables (no Map size limit) and binary STL keeps its triangles in fixed blocks: 20 M triangles parse in about 4 s (was 43 s) and computeStats no longer throws.
- VWR-48: `nodeModelWorker` (`ModelWorker` port): parse and build the BVH in a worker_thread, buffers transferred, typed errors across the boundary, abort terminates; `WorkerCrashedError`.
- VWR-47: `parseModel` (format detection, soft triangle cap with confirm, hard cap and file-size cap) and `TooManyTrianglesError`; text parsers refuse lines over 1 MiB.
- VWR-40: `parseAsciiStl` (streaming ASCII STL, CRLF and odd whitespace) and `MalformedMeshError`.
- VWR-41: `parseObj` (streaming OBJ geometry: n-gon fans, negative indices, groups and objects as parts).
- VWR-39: `parseBinaryStl` (streaming binary STL with guard rails) and `isBinaryStl`.
- VWR-35: STL and OBJ fixture corpus (`test/fixtures/stl-obj`) with generator and oracle scripts.
- VWR-46: `buildBvh`, `serialiseBvh`, `deserialiseBvh` (three-mesh-bvh 0.9.16, indirect, transferable buffers).
- VWR-34: module scaffold: layers `domain`, `application`, `adapters`.
- VWR-38: `IndexedMesh`, `MeshPart`, `BoundingBox`, `MeshStats` and typed `MeshError`s (truncated, count mismatch, non-finite, OBJ index out of range, file too large), each with a user message.
- VWR-42: `weld` (triangle soup to indexed mesh) and `fromArrays` (validating wrap of typed arrays).
- VWR-43: `computeStats`: bounds, signed volume, open and non-manifold edges, degenerate triangles.
