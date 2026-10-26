---
id: 27
title: Read Cura workspace containers
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US7
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [20]
created: 2026-10-25
---

Reads the `Cura/*.cfg` files as raw INI containers beside the core model; also opens a plain Cura model 3MF.

**Code:** `vsslicer/modules/3mf/src/adapters/cura/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Containers are returned raw and byte-equal to the parts
- [x] Objects from the core model match the golden
- [x] A plain Cura model 3MF opens as `cura` or `core` per the detection rule

## Tasks

- [x] INI container reader
- [x] Golden

## Progress

Not started.

**Dependency on VWR-12 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with VWR-12.

### sp11-vwr-27

Added `src/adapters/cura/readCura.ts` (`createCuraReader(readCore): DialectReader`) and `test/readCura.test.ts` (4 tests, synthetic package; the golden is the core read of the same model, compared with toEqual). `Cura/<name>.cfg` parts go to `rawConfig` as the same Uint8Array (byte-equal); other non-model parts (version.ini, nested, thumbnails) are preserved; objects/instances come from the core read. A package with no `Cura/` part detects as core and never reaches the reader. Not parsed as INI: the card says raw. No Bounds criterion needed: no parsing, linear filter over parts.
Mutation probes (all fail the tests): nested-path regex loosened, containers dropped, preserved filter not excluding containers, preserved dropped, dialect override removed.
Verification: readCura tests 4/4, eslint and prettier clean on my files. Module `pnpm build`/`pnpm test`/`pnpm lint` currently fail only on VWR-31 worker files (TS2322 ArrayBufferLike in src/adapters/worker/*Client.ts, prettier on handle.ts/protocol.ts), not mine; `run.mjs checks` not conclusive for that reason. CI gate platform: not examined; code has no platform dependence.
Release lines:
- CHANGELOG: Added: `cura` dialect reader (`createCuraReader`): `Cura/*.cfg` containers raw in `rawConfig`, objects from the core model (VWR-27).
- index.ts: `export { createCuraReader } from './adapters/cura/readCura.ts';`
- readProject.ts wiring: `readers: new Map([['cura', createCuraReader(readCore)]])` (merge with other dialects' entries), importing `createCuraReader` from './adapters/cura/readCura.ts'. Note `test/readProject.test.ts` "no reader" check uses a Bambu file, unaffected.

**Review passed (sp11-rev-vwr-27)**

Ran in `vsslicer/modules/3mf`: `pnpm install` ok; `test/readCura.test.ts` 4/4; `pnpm lint` exit 0; `pnpm build` exit 0; `pnpm test` 16 files, 243/243 (an earlier run had 7 failures in `readBambu.test.ts` and others from the VWR-21/31 work in progress, none in cura; they passed on rerun); `node scripts/run.mjs checks` exit 0. eslint and prettier are clean on `src/adapters/cura/` and the test.

Criteria: (1) containers go into `rawConfig` as the same `Uint8Array`, checked with `toBe`. (2) objects and instances equal the core read of the same package, which is the golden the card's author chose; the reader spreads `core`, so this checks that nothing overrides it. (3) a package with no `Cura/` part detects as `core` and never reaches the reader (`detectDialect.ts:45`). Upstream citation `Cura@5bea2f8:plugins/3MFWriter/ThreeMFWorkspaceWriter.py:171` (`"Cura/%s.%s"`) checks out.

Mutation probes, run in a `mktemp -d` copy: 6 killed (dropping the `i` flag, copying the bytes, removing the `dialect` override, emptying `objects`, letting containers into `preserved`, allowing nested `.cfg`). Dropping `...core.preserved` or `...core.rawConfig` survives, but these are equivalent mutants: the core read always returns both empty (`project.ts:111-112`).

Hostile names: `CURA/B.CFG` goes to `rawConfig`. `/Cura/a.cfg`, `Cura/.cfg`, `Cura/a.cfg/` and a 100k-character name are all preserved raw, so no part is lost. The regex is anchored and has no nested quantifiers, so it runs in linear time. Layering is fine: the adapter imports only application and domain types, with no cross-module imports.

Notes for the coordinator (none of these fails the card):
- Material containers are written as `Cura/<id>.xml.fdm_material` (Cura@5bea2f8:plugins/XmlMaterialProfile/__init__.py:35, written by the same `_writeContainerToArchive`). They land in `preserved`, not `rawConfig`, because the card limits containers to `*.cfg`. If they should count as containers, that needs a follow-up card.
- `index.ts` export, `readProject.ts` wiring and the CHANGELOG line are not applied yet. The worker's release lines above are correct.
