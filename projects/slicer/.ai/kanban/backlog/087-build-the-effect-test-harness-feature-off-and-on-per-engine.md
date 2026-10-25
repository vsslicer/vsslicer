---
id: 87
title: "Build the effect-test harness: feature off and on, per engine"
type: feature
priority: P0
effort: M
model: opus
area: [engine]
story: US28
milestone: "VSS:M3"
depends_on: [83, 6, 1, GCP-3, GCP-4]
created: 2026-10-25
---

A testkit entry `defineEffectTest({row, patch, fixture, assert})` that slices a fixture twice (feature off, on) through an adapter-supplied `slice(patchedSettings)` callback, parses both outputs with `@vsslicer/gcode`, and asserts the measurable effect. It skips an engine whose table marks the key unsupported, and asserts the entry is `unsupported`.

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] The harness runs with the fake engine and canned G-code in this module's tests
- [ ] Each test records the regression it guards in its definition (field required)
- [ ] An engine marked supported whose effect is absent fails; an engine marked unsupported is skipped with the table entry asserted

## Tasks

- [ ] API of `defineEffectTest`
- [ ] Parser helpers (roles, widths, Z, feedrate)
- [ ] Tests with canned G-code

## Progress

Not started.
