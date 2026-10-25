---
id: 255
title: Load the occt-import-js WASM as a separate file and report it unavailable when absent
type: feature
priority: P1
effort: M
model: opus
area: [step, mesh]
story: US70
milestone: "VSS:M4"
depends_on: [254, 252]
created: 2026-10-25
---

Loads the WASM from a path the caller gives, never bundled into the JavaScript. A missing file or a failed load is reported as unavailable, not thrown into the caller.

**Code:** `vsslicer/modules/mesh-step/src/adapters/occt/` (module: `mesh-step`, layer: `adapters`)

## Acceptance criteria

- [ ] With the file present, the module initialises and reads a tiny STEP string
- [ ] With the file absent, `isAvailable()` is false and the error is the WASM load failure class
- [ ] A bundle assertion proves the WASM bytes are not in the built JavaScript
- [ ] Licence notice for the WASM is in the package

## Tasks

- [ ] Loader
- [ ] Availability check
- [ ] Bundle assertion

## Progress

Not started.
