---
id: 37
title: "Spike: parse, dedup and BVH time and memory at 1, 5 and 20 M"
type: spike
priority: P0
effort: M
model: opus
area: [mesh]
story: US10
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [36, 34]
created: 2026-10-25
---

Measures a throwaway pipeline (three.js STLLoader read for patterns only, three-mesh-bvh) to see whether 20 M triangles are feasible before the real parsers exist, and answers 3d-viewer open question 3.

**Code:** notes in `.reference/notes/` and numbers in `vsslicer/modules/mesh/README.md` (module: `mesh`, layer: n/a (spike))

## Acceptance criteria

- [x] Time and peak memory recorded for parse, dedup and BVH at 1, 5 and 20 M in a worker
- [x] States whether single-worker build fits and whether the bounding-box fallback is needed
- [x] Method and machine recorded so the final benchmark can compare

## Tasks

- [x] Prototype the pipeline
- [x] Measure
- [x] Write up

## Progress

Done (vwr37-worker). Measured the committed module (parseBinaryStl, weld, computeStats, buildBvh), not a
throwaway STLLoader pipeline, in a worker_threads Worker, fresh process per stage, 3 runs each, Node 26.12.1
on Apple M1 Pro 16 GB. Fixtures from scripts/generate-large-fixture.mjs (seed 1). Notes, method, bench
script and raw rows: .reference/notes/VWR-37-mesh-spike.md, VWR-37-bench.mjs, VWR-37-results.txt.

| tris | parse (incl. weld) | weld | computeStats | buildBvh | peak RSS |
|---|---|---|---|---|---|
| 1 M | 1.9 s | 1.1 s | 0.7 s | 0.4 s | 0.46 GB |
| 5 M | 13.5 s | 5.4 s | 3.8 s | 1.8 s | 0.97 GB |
| 20 M | 43.4 s | 22.1 s | throws RangeError (Map > 2^24) | 7.5 s | 2.86 GB |

Hotspots: Float32Array.from growth = 18.5 s of the 20 M parse (new+set: 0.4 s) and 1.8 GB transient for a
720 MB soup (capacity 1.68x, old+new alive). weld ~1.1 s per M triangles, linear; its string-keyed Map also
caps at 2^24 unique vertices. New bug: computeStats' edge Map overflows above ~11 M triangles.
Measured 18 B/tri indexed + 8.8 B/tri BVH (research guessed ~24 + BVH).

Decision: single worker fits at 1 M, and at 5 M on memory but not time (~17-20 s); 20 M does not fit with
the current code. BVH alone fits in one worker at all sizes. Bounding-box fallback (VWR-66) confirmed;
proposed initial threshold 5 M, re-set by VWR-50. Proposed bugfix cards (mesh): computeStats edge Map
(domain, P0); preallocate/set-grow binary-stl soup (adapters); typed-array hash weld (domain).

Not done: no Chrome/webview measurement (3d-viewer open question 3 answered for Node only); heap peaks
are sampled at stage ends only. Files changed: vsslicer/modules/mesh/README.md (numbers section).
No module code changed; prettier check on README passes.


Review passed (vwr374748-reviewer): recomputed every table cell from VWR-37-results.txt medians (parse, weld, stats, bvh, pipeline RSS 2877/2856/2747 -> 2.86 GB at 20 M, 18 and 8.8 B/tri); all match README and notes. Decision (5 M fits memory not time ~19 s, 20 M does not fit, box fallback needed) follows from them. Caveats noted by the author: Node 26 not 24, no Chrome, ~11 M stats limit is derived (1.5 edges/tri), not bisected.
Changelog: README: VWR-37 spike numbers for parse, weld, stats and BVH at 1, 5 and 20 M triangles.
