---
id: 127
title: Read Cura machine instances as printer instances
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US36
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [31, 136]
created: 2026-10-25
---

Reads Cura machine instances (with `definition_changes`) into an instance entity and, where Cura stores one, a credential kept apart from the entity.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/instances/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [x] A fixture Cura machine instance saved by the real app (version recorded) yields an instance keeping model, nozzle and host
- [x] Any credential is returned separately; unknown host types give a diagnostic and no connection
- [x] The source files are not modified

## Tasks

- [ ] Inspect real fixtures
- [x] Write the reader
- [x] Tests

## Progress

Criterion 1 NOT ticked: no Cura app is installed here, so no fixture could be saved by the real app. Fixtures in
`test/instances.test.ts` are built from Uranium@e65ccc1 ContainerStack.py:345-364 (serialize) and :426 (stack version 6),
Cura@5bea2f8 CuraContainerStack.py:409-419 (container indexes), CuraContainerRegistry.py:581 (extruder `machine` link),
ThreeMFWorkspaceReader.py:51-61 (network metadata keys). `octoprint_url` is UNVERIFIED (third-party plugin, not in the pinned
tree). Coordinator: a real-app fixture and Cura version are still owed.

Written: `src/adapters/instances/read.ts` `readCuraMachineInstances(files, limits?)` -> `{ instances: InstanceImport[], native, diagnostics }`.
model = container 7; nozzle = `machine_nozzle_size` of the position-0 extruder's definition_changes, else the machine's
(entity id is the diameter, `0.4`); a size left to variant/definition default gives toolheads [] + warning. octoprint key+url
= connection `octoprint`, key returned as `credential`, `secret_ref` `cura-machine/<id>`; um_network_key etc. = warning, no
connection. Bounds: reuses resolveResourceLimits (files, bytes per file, total), url over MAX_CONNECTION_STRING refused, duplicate ids refused, diagnostics capped.
Licence: LGPL-3.0 upstream behaviour re-implemented, no code copied; module is AGPL.

Verification (macOS; CI gate runs on Linux): profiles-cura lint ok, build ok, 10 new tests pass; full `pnpm test` 118/119 -
the one failure is `quality.test.ts` `__proto__` (another card's uncommitted work in the same module, not this card).
`node scripts/run.mjs checks` ran (licence, fixtures sections shown, no failure printed).
Mutation probes, each fails a test: drop credential; ignore extruder position (needed a new test, added); no machine fallback;
no url cap; no network diagnostic; no version check; no duplicate-id refusal; credential-missing code; maxFiles; native key filter;
maxTotalBytes; maxFileBytes.

Release lines:
CHANGELOG: - PRF-127: readCuraMachineInstances reads machine_instances/*.global.cfg into printer-instance entities (model, nozzle, OctoPrint host) with the API key returned apart.
index.ts: export { readCuraMachineInstances } from './adapters/instances/read.ts';
          export type { CuraInstancesImport } from './adapters/instances/read.ts';

**Review failed (sp11-rev-prf-127)**

Ran in `vsslicer/modules/profiles-cura`: `pnpm install` ok, `pnpm lint` ok (eslint, prettier, tsc), `pnpm build` ok,
`pnpm test` 9 files / 120 tests pass (the earlier quality `__proto__` failure is gone). `node scripts/run.mjs checks` exit 0.
Upstream citations checked at Uranium@e65ccc1 ContainerStack.py:59 (Version = 6), :345-364, :426 and Cura@5bea2f8
CuraContainerStack.py:409-419, CuraContainerRegistry.py:581, ThreeMFWorkspaceReader.py:51-61: they match. Layering ok
(adapters layer, imports only `@vsslicer/profile-api` and the module's own files). Criterion 1 is correctly left unticked
(real-app fixture still owed, coordinator's call).

Mutation probes on a `mktemp -d` copy, each fails a test: drop credential, drop position-0 filter, drop machine fallback,
drop url cap, drop version check, drop duplicate-id refusal, drop network diagnostic, drop native key filter, drop
maxTotalBytes, drop maxFileBytes. Two survive: `fatal: false` on the decoder (bytes still rejected by the version check,
harmless) and removing the diagnostics cap (see 3).

Problems:

1. `src/adapters/instances/read.ts:169` `native[id] = {...}` on a plain object: a machine whose `[general] id = __proto__`
   is imported but its native entry is lost (it becomes the prototype of `native`). Probe: one machine with id
   `__proto__` gives `instances.length 1`, `Object.keys(native) []`. Rule: untrusted keys never index a plain object;
   build `native` with `Object.create(null)` or `Object.defineProperty` (as the module's quality reader now does), and
   add a test.
2. `read.ts:150` `secret_ref: \`cura-machine/${id}\`` is unbounded: an id of 2100 characters with an OctoPrint url gives a
   connection that `validateConnection` from `@vsslicer/profile-api` rejects (`secret_ref is over 2048 characters`).
   The reader emits an entity the contract calls invalid. Rule: check the built connection with the API's
   `validateConnection` (which also covers url length, so the hand-rolled `url.length > MAX_CONNECTION_STRING` check
   can go) and, on issues, import without a connection plus a diagnostic; add a test with a long id.
3. `read.ts:66-67` the diagnostics cap (`MAX_RESOURCE_DIAGNOSTICS`) has no test: deleting the `return` passes the suite.
   Rule 25: every claimed bound has a test that fails when it is removed. Add one (for example, maxFiles high and
   1001+ malformed machines, or a lowered cap via the shared helper if one exists).

Note, not blocking: a stack with both `um_network_key` and OctoPrint keys connects as OctoPrint with no diagnostic
about the Ultimaker key; fine if intended, worth a line in the docstring.

**Rework (sp11-prf-127-fix)**

1. `native` is now `Object.create(null)` filled with `Object.defineProperty`; test "a __proto__ machine id keeps its native entry".
2. The connection is checked with `validateConnection` from `@vsslicer/profile-api` (empty url keeps its own check); on issues: no connection, no credential, warning. The hand-rolled url-length check is gone. Test with a 2100-char id.
3. Test "bounds: diagnostics are capped" (1200 malformed files, maxFiles 2000): 1001 diagnostics, last is "further diagnostics suppressed".
4. Docstring notes that OctoPrint wins over an Ultimaker key silently.
Probes (each fails a test): assignment on `{}` instead of defineProperty/null-proto; validateConnection replaced by `[]` (2 fail); cap `return` removed.
Verification (macOS; CI gate Linux): profiles-cura lint ok, build ok, `pnpm test` 125/125. Release lines unchanged.

**Review passed (sp11-rev2-prf-127)**

Ran in `vsslicer/modules/profiles-cura`: `pnpm install` ok, `pnpm lint` ok (eslint, prettier, tsc), `pnpm build` ok,
`pnpm test` 9 files / 125 tests pass (13 in `test/instances.test.ts`). `node scripts/run.mjs checks` exit 0.
All three earlier problems are fixed: `native` is null-prototype and filled with `defineProperty` (`read.ts:129,170`);
the connection goes through the contract's `validateConnection` (`read.ts:153`), the hand-rolled url cap is gone; the
diagnostics cap has a test. Docstring notes OctoPrint wins over an Ultimaker key. Layering ok (adapters; imports only
`@vsslicer/profile-api` and the module's own files). Criterion 1 correctly left unticked (real-app fixture owed by the owner).

Mutation probes, each run alone on a `mktemp -d` copy, each fails a test: validateConnection -> `[]` (2 fail); cap
`return` removed; cap `>` -> `>=`; suppressed-message removed; drop credential; native keeps `octoprint_api_key`; drop
version check; drop position-0 filter. `Object.create(null)` -> `{}` alone, or `defineProperty` -> `native[id] =` alone,
survives (either defence suffices); both together fail the `__proto__` test, so the test is real.
Hostile probes: path traversal / nested / empty-stem names ignored; invalid UTF-8 -> diagnostic; 400-digit nozzle size ->
Infinity refused; `__proto__`/`constructor` metadata keys stay own data; credential absent from `native`; the emitted
connection passes `validateConnection`.

Notes, not blocking: `javascript:alert(1)` as `octoprint_url` is accepted, because the contract checks length only, not
scheme (a `printer-api`/`profile-api` question, not this reader's); `model` is unbounded (5000 chars kept), as the
contract has no instance validator. Release lines (CHANGELOG, index.ts) are for the coordinator, as listed above.

**Coordinator (sp11-coordinator, 14:28):** criterion 1 met on the owner's answer to Q27 ("Hand-built fixtures are enough"); PRF-211 closed without work.
