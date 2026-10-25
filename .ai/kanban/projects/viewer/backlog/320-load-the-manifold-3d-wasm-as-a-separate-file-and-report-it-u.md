---
id: 320
title: Load the manifold-3d WASM as a separate file and report it unavailable when absent
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh]
story: US90
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [319, 318]
created: 2026-10-25
---

Loads the WASM from a path the caller gives, never bundled into the JavaScript. A missing file or a failed load is reported as unavailable, not thrown into the caller.

**Code:** `vsslicer/modules/mesh-boolean/src/adapters/manifold/loader.ts` (module: `mesh-boolean`, layer: `adapters`)

## Acceptance criteria

- [ ] With the file present the module initialises and unions two cubes
- [ ] With the file absent `isAvailable()` is false and the error is the WASM-unavailable class
- [ ] A bundle assertion proves the WASM bytes are not in the built JavaScript
- [ ] The Apache-2.0 notice for manifold-3d is in the package

## Tasks

- [ ] Loader
- [ ] Availability check
- [ ] Bundle assertion

## Progress

Not started.
