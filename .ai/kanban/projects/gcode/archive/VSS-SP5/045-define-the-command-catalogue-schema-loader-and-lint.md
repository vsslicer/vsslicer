---
id: 45
title: "Define the command catalogue schema, loader and lint"
type: feature
priority: P0
effort: M
model: sonnet
area: [language]
story: US16
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [44]
created: 2026-10-25
---

Catalogue as a data module in `@vsslicer/gcode` for hovers and later E50. Descriptions are written by us; each entry links reprap.org/wiki/G-code, the Prusa Buddy page or the Klipper G-code reference.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [x] Schema with code, parameters, flavours, description, source link
- [x] Lint fails CI for an entry without a source link or flavour list (test with a bad entry)

## Tasks

- [x] Schema
- [x] Loader
- [x] Lint script and CI step

## Progress

Fix round: addressed the review FAIL and GCP-46/47 reports. Only `src/domain/catalogue.ts` and `test/catalogue.test.ts` changed.
- Sources now allowed (https only, host + path equal to the base or under `base/`): reprap.org/wiki/G-code, marlinfw.org/docs/gcode, github.com/prusa3d/Prusa-Firmware-Buddy (exact repo, lookalike `...-Buddy-evil` rejected), github.com/SoftFever/OrcaSlicer, www.klipper3d.org/G-Codes.html, docs.duet3d.com (any path). Error text lists them.
- Codes: `[GMT]\d+(\.\d+)?` or Klipper extended `[A-Z][A-Z0-9_]+` (2+ chars; lowercase, `G`, `1G`, `G1 X`, empty rejected).
- Tests: shipped catalogue test asserts it loads/validates and includes G1 and M104 (no hard-coded list); new tests for each new source, Buddy lookalike, http rejection, extended command, garbage codes.
- Verified in gcode-language: `pnpm lint` ok, `pnpm test` 14 pass 0 fail (with all six catalogue/*.json files, none failed the validator), `pnpm build` ok.
- CHANGELOG: "- Added: command catalogue schema, validator, loader and lint test (marlinfw.org, docs.duet3d.com, OrcaSlicer sources; Klipper extended command codes)". Coordinator: add `"catalogue"` to package.json `files` if it ships.
- Files: src/domain/catalogue.ts, src/adapters/catalogue.ts, catalogue/reprap.json, test/catalogue.test.ts.
- Review (gcode45-rereview): PASS, docs.duet3d.com now allowed (https, any path); marlinfw.org/docs/gcode, SoftFever/OrcaSlicer, exact Buddy repo (lookalike rejected), https-only and Klipper extended codes implemented and tested; shipped-catalogue test no longer hard-codes the list; domain has no I/O (loader in adapters); lint, 14 tests, build all pass.
