---
id: US26
title: "See what each engine supports per setting"
status: reviewed
epic: VSS:E30
---

As a user (and as PRF's settings form), I want every unified setting marked supported, renamed or unsupported per engine, so that nothing is silently ignored.

## Acceptance criteria

- [ ] `SlicerEngine.capabilities(): CapabilityTable` returns per unified key `supported | renamed(nativeKey, valueMap) | unsupported` plus the engine version range; one table per adapter, as JSON with a JSON Schema
- [ ] Tables for Orca and CuraEngine validate against the schema and cover every unified key in E11's schema; the test fails on an unmapped key (regression: PRF adds keys)
- [ ] A generated Markdown capability report per pinned engine version is committed with the tests
- [ ] `renamed` mappings are applied by emission (US8, US13)

## Out of scope

- The PrusaSlicer column (E65)
