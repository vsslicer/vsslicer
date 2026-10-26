# @vsslicer/mesh

Triangle meshes: the `IndexedMesh` model and typed mesh errors (domain). Parsers, statistics and
workers are added by later cards. Layers: `domain` (pure), `application`, `adapters`.

## Spike numbers (VWR-37)

Binary STL, median of 3 runs in a Node worker thread (Node 26.12.1, Apple M1 Pro, 16 GB). Method and
raw rows: `.reference/notes/VWR-37-mesh-spike.md`. The real benchmark is VWR-50.

| Triangles | Parse (incl. weld) | Weld alone | computeStats | buildBvh | Peak RSS |
| --------- | ------------------ | ---------- | ------------ | -------- | -------- |
| 1 M       | 1.9 s              | 1.1 s      | 0.7 s        | 0.4 s    | 0.46 GB  |
| 5 M       | 13.5 s             | 5.4 s      | 3.8 s        | 1.8 s    | 0.97 GB  |
| 20 M      | 43.4 s             | 22.1 s     | fails (Map)  | 7.5 s    | 2.86 GB  |

computeStats throws `RangeError: Map maximum size exceeded` above about 11 M triangles. Soup growth
through `Float32Array.from` costs 18.5 s and 1.8 GB transient at 20 M.
