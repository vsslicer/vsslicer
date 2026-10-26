---
id: 389
title: "Make weld, computeStats and binary STL parsing work at 20 M triangles"
type: bug
priority: P0
effort: M
model: opus
sprint: "VSS:SP6"
created: 2026-10-26
---

Found by the VWR-37 spike (SP6, `.reference/notes/VWR-37-mesh-spike.md`): at 20 M triangles `computeStats` throws `RangeError: Map maximum size exceeded` (the edge Map holds one entry per edge, over 2^24 above about 11 M triangles), weld's string-keyed Map has the same 2^24 limit on unique vertices and costs about 1.1 s per million triangles, and binary-stl's buffer growth with `Float32Array.from` takes 18.5 s of a 20 M parse and holds about 2.5x the payload.

**Code:** `vsslicer/modules/mesh/src/domain/stats/compute-stats.ts`, `src/domain/build-mesh.ts` (domain), `src/adapters/stl/binary-stl.ts` (adapters)

## Acceptance criteria

- [x] computeStats and weld work at 20 M triangles (no Map size limit: typed-array open-addressing hash or sort-based), with results equal to the current code on the 300-mesh random test
- [x] binary-stl preallocates from the header count (bounded by file size) or grows with `new` + `set`; peak memory at most about 1.3x the payload
- [x] The VWR-37 table re-measured at 1, 5 and 20 M in the card's Progress

## Tasks

- [x] Edge hash for computeStats
- [x] Vertex hash for weld
- [x] Binary STL buffer
- [x] Re-measure

## Progress

Done (vwr389-worker). Notes: `.reference/notes/VWR-389-mesh-20m.md`.

- weld (domain): typed-array open-addressing hash on the float32 bits (load <= 0.5, rehash on growth), ids in
  first-appearance order so output equals the Map version; now also accepts a list of soup blocks.
- computeStats (domain): edge counts in an open-addressing hash over Uint32Array/Uint8Array (count capped at 3). No Map.
- binary-stl (adapters): soup kept as fixed 2.4 MB blocks, never copied; weld reads the blocks. The parser gets no
  file size, so it does not preallocate from the header count (hostile-count guard kept).

Verified: `pnpm lint && pnpm build && pnpm test` pass (51 tests). Scratch check: 300 random meshes, new weld and
computeStats equal to the old code (positions, indices, open/non-manifold/degenerate counts), and a 2-block weld
equals the single-array weld. That comparison is a scratch script, not added to the suite.

VWR-37 bench, one run each, M1 Pro, Node 26 (was = VWR-37 median):

| triangles | parse (incl. weld) | weld alone | computeStats | buildBvh | parse peak RSS | pipeline peak RSS |
|---|---|---|---|---|---|---|
| 1 M | 151 ms (was 1,940) | 99 (was 1,058) | 116 (was 692) | 314 | 176 MB (was 330) | 343 (was 464) |
| 5 M | 863 (was 13,540) | 650 (was 5,444) | 861 (was 3,779) | 1,580 | 519 (was 751) | 1,119 (was 974, range 763-1,534) |
| 20 M | 3,791 (was 43,371) | 3,252 (was 22,087) | 4,112 (was RangeError) | 7,998 | 1,423 (was 2,144) | 1,965 (was 2,856 without stats) |

Memory criterion: the soup buffer is now 1.0x its size plus one 2.4 MB block (was ~2.5x). Whole-process parse peak
at 20 M is 1.42x the 1.0 GB file (1.98x the 720 MB soup) because it also holds weld's output and hash; reviewer
decides whether "1.3x the payload" meant the buffer (met) or the whole parse (not met).

Files: `vsslicer/modules/mesh/src/domain/build-mesh.ts`, `src/domain/stats/compute-stats.ts`, `src/adapters/stl/binary-stl.ts`.

Changelog: `- weld, computeStats and binary STL parsing handle 20 M triangles: typed-array hashes replace the size-limited Maps (20 M stats no longer throws), and the binary STL soup is kept in blocks instead of regrown (20 M parse 43 s to 3.8 s, peak RSS 2.1 to 1.4 GB). (VWR-389)`

Review passed (vwr389-prf177-reviewer): mesh `pnpm install && pnpm lint && pnpm build && pnpm test` pass (53 tests, incl. other lanes' files). Own equality probe against HEAD's build-mesh.ts and compute-stats.ts (copied to scratch): 300 random soups (pools of 1-4000 points, -0/+0 mixes, 1e-30/1e30 values), positions, indices, bounds and computeStats identical, and identical again when the soup is split into random 9-multiple blocks; 100 random indexed meshes with repeated/degenerate indices give identical stats; a 900 k-vertex one-bit-apart grid (and its coordinate permutation) forces many table growths and keeps every vertex distinct; -0 merges with 0 and never appears in output; NaN/Infinity throw the same NonFiniteCoordinateError (same vertex index) as before, also through blocks; a non-multiple-of-9 block throws RangeError; empty soup equal. 20 M run (generator seed 1, 19,998,780 triangles, 954 MB file): parse 4.0 s, computeStats 4.5 s, 9,999,392 vertices (= T/2 + 2, closed), 0 open / 0 non-manifold edges, max RSS 1.38 GB. Memory criterion ticked by the reviewer under the buffer reading: the finding it answers was the soup buffer holding ~2.5x the payload, and the blocks hold 1.0x plus one 2.4 MB block, better than both named options (preallocate or new+set) and still safe against a hostile header count; a whole-process 1.3x was never reachable by those options, since weld's own output (360 MB at 20 M) comes on top of the 720 MB soup. Whole-process parse peak is 1.38-1.42 GB, 1.45x the file. Domain files stay pure; no ported code.
