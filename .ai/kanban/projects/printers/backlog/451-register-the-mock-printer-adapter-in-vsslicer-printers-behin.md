---
id: 451
title: Register the mock printer adapter in vsslicer.printers behind a setting
type: feature
priority: P0
effort: S
model: sonnet
area: [api]
story: US75
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [450, 17, PLT-205]
created: 2026-10-27
---

Make the mock printers available in the Printers view and Add printer (PRN-20, PRN-21) when a setting is on, and turn it on in the VSSlicer profile so the sandbox shows them (D23).

**Code:** `vsslicer/modules/apps/printers/src/presentation/` and `package.json`; `vsslicer/scripts/vsslicer.code-profile` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `printers-extension` depends on `@vsslicer/printer-mock` by semver range and registers its adapter and discoverer with the registry (PRN-17) only while `vsslicer.printers.mock.enabled` is true (default false); turning it off removes mock printers from the registry without a reload
- [ ] `vsslicer.printers.mock.scenario` (object, optional) overrides the default scenario; a malformed scenario is reported once and the default is used
- [ ] The VSSlicer profile (PLT-205) sets `vsslicer.printers.mock.enabled: true`
- [ ] Integration test (`pnpm test:integration`): with the setting on, the registry lists the `mock` adapter and discovery returns the default printers; with it off, neither

## Tasks

- [ ] Dependency and conditional registration
- [ ] Settings contribution and profile entry
- [ ] Integration test

## Progress

Not started.
