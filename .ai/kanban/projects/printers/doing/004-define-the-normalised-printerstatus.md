---
id: 4
title: Define the normalised PrinterStatus
type: feature
priority: P0
effort: M
model: opus
area: [api]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP10"
depends_on: [2]
created: 2026-10-25
---

The status every adapter maps into, designed with the hardest case (Bambu AMS and HMS) in view.

**Code:** `vsslicer/modules/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [x] State enum `idle|printing|paused|error|busy|offline` plus the vendor state string; temperatures per heater; job (file, progress, remaining time); file position (`byteOffset`, optional `layer`, `percent`); `materials[]` (tray, type, colour, remain); `notifications[]` (code, severity, message, link)
- [x] Types accommodate an H2C dual-nozzle shape (several toolheads and extruders) in a fixture, checked by a type test
- [x] Immutable value objects with a `merge` helper for partial pushes (property test: merging full over full is identity)
- [x] **Bounds:** `merge` and the constructors cap arrays (heaters 64, toolheads 16, materials 256, notifications 256) and strings (vendor state 256, messages 4,096), refusing or truncating with a named reason; numeric fields validated finite (temperatures -50..1000, percent 0..100, byteOffset non-negative integer)

## Tasks

- [x] Write the types
- [x] Write the merge helper
- [x] Type and property tests

## Progress

sp9-prn-4 (2026-10-26):

- Added `vsslicer/modules/printer-api/src/domain/status.ts` (domain layer): `PRINTER_STATES`
  (`idle|printing|paused|error|busy|offline`) plus `vendorState`; `Heater` (id, kind
  nozzle/bed/chamber/other, current, target, extruder link); `Toolhead { index, activeExtruder,
  extruders: Extruder[] }` and `Extruder { index, nozzleDiameter, nozzleType, tray }`; `Job` (file,
  progress, remainingSeconds); `PrintPosition` with D20's field names (`fileOffset`, `layer`, `z`,
  `percent`, at least one set), so the card's `byteOffset` is `fileOffset` here. It is a structural
  copy of D20's type, so printer-api takes no dependency on gcode-api; `Material` (tray, type,
  colour, remain); `Notification` (code, severity info/warning/error/fatal, message, link);
  `truncations[]`.
- `createPrinterStatus(input)` validates, caps and deep-freezes the status. Bad numbers and enums throw
  `InvalidStatusError` (a `PrinterError` of kind `protocol`, with `field` and `reason`:
  notFinite/outOfRange/notInteger/invalidValue/missing). Over-long lists and strings are truncated,
  and each cut is recorded as `{ field, reason: tooMany|tooLong }`. Caps are in `STATUS_LIMITS`: heaters 64,
  toolheads 16, extruders per toolhead 16, materials 256, notifications 256, vendor state 256, ids
  256, messages/file/link 4,096. Ranges: temperatures -50..1000, percent and progress 0..100,
  fileOffset and layer non-negative safe integers. Layer 0 is allowed because Bambu reports 0 before
  the first layer. Lists are read only up to the cap, so a huge array costs O(cap).
- `mergeStatus(base, patch)` applies a partial push. Heaters merge by id, toolheads by index,
  extruders by index, and materials by tray. Notifications and position are replaced, and `null`
  clears job or position. The result goes back through `createPrinterStatus`, so caps apply again.
- `test/status.test.ts` has 16 tests: an H2C fixture (one toolhead with two extruders and an AMS of 4)
  with `satisfies` and `expectTypeOf` type checks (D20 field names pinned), a 200-seed property test
  (merge(full, full) and merge(full, {}) are identity), keyed merge, 10 refusal cases, caps with
  named reasons, and a hostile 10^7-element Proxy array that counts reads (exactly the cap).
- Verified: `pnpm test` 34/34 (5 files), `pnpm lint` clean, `pnpm build` ok. `node scripts/run.mjs
  checks` passes everything except check-licence on `modules/profile-catalogue-data/package.json`,
  which is not this card's file.
- For the coordinator, the line to add to `vsslicer/modules/printer-api/src/domain/index.ts` (the barrel
  that `src/index.ts` re-exports; `src/index.ts` itself needs no change):
  `export * from './status.ts';`
  If you would rather export it from `src/index.ts`: `export * from './domain/status.ts';`
  Suggested CHANGELOG line: `- Normalised PrinterStatus value objects with createPrinterStatus and mergeStatus (PRN-4).`
- Not done: no duplicate-key check inside one list (two heaters with the same id are kept, and merge
  updates the first). Truncations are recomputed on each merge, not carried over from the base.

**Review failed (sp9-rev-prn-4)** (2026-10-26)

Ran: `pnpm test` 34/34 (5 files), `pnpm lint` clean, `pnpm build` ok. `node scripts/run.mjs checks`: everything passes
except check-licence, whose 13 problems are all in `modules/profile-catalogue-data` (missing SPDX headers, another
card's). Mutation probes run in a `mktemp -d` copy of the module: making `byKey` never match a key fails the property
test and the keyed-merge test; reading `max + 1` list items fails the caps test and the hostile 10^7-array test. So
the tests can fail. The domain is pure: `status.ts` imports only `./errors.ts` and does no I/O. The design fits the
research and D20. The state enum plus `vendorState`, heaters with kinds, toolheads holding extruders (the H2C shape),
AMS trays and HMS codes cover Bambu, Moonraker, PrusaLink and OctoPrint. Renaming `byteOffset` to `fileOffset` is
right, because D20 is accepted and uses `fileOffset`. A structural copy instead of importing gcode-api is fine (KISS,
no API-to-API dependency), and the `expectTypeOf` test pins the field names so drift shows up. Allowing `layer` 0 is
justified by the Bambu note.

Both issues the worker left open break the card's own property ("merging full over full is identity") on valid
statuses that `createPrinterStatus` accepts, so both must be fixed now:

1. `vsslicer/modules/printer-api/src/domain/status.ts:183` (also `:226` and the toolhead and extruder lists):
   duplicate keys are accepted, and `byKey` (`:256`) then merges every patch item into the first match. Probe:
   heaters `[{id:'a',current:1},{id:'a',current:2}]`, then `mergeStatus(s, s)` gives `[{current:2},{current:2}]`.
   That is not identity, and the first heater's reading is silently overwritten. A patch `{id:'a',current:50}` only
   ever reaches the first entry. Fix: `createPrinterStatus` refuses a repeated heater id, toolhead index, extruder
   index within a toolhead, or material tray with `InvalidStatusError(<field>[i].<key>, 'duplicate')` (add
   `'duplicate'` to `InvalidStatusReason`). Add one refusal case per list and one property seed check.
2. `status.ts:251` and `:293`: `mergeStatus` recomputes truncations from data that has already been cut, so it drops
   them. Probe: `vendorState` of 300 chars gives `truncations [{vendorState,tooLong}]`, but `mergeStatus(s, s)` and
   `mergeStatus(s, {state:'busy'})` both give `[]`. That breaks identity and hides the cut from consumers. Fix: the
   merged truncations are the new ones plus every base truncation whose top-level field (the name before the first
   `[` or `.`) the patch did not set, deduped. Test that `merge(s, s)` and `merge(s, {state})` keep a truncation,
   and that `merge(s, {vendorState:'ok'})` clears it.

For the coordinator, not a defect of this card: `src/domain/index.ts` does not export `status.ts` yet (the worker
left the line above), so the contract is not public until that line lands.

sp9-prn-4-fix (2026-10-26), both review problems fixed:

1. Duplicate keys: `createPrinterStatus` now refuses a repeated heater id, toolhead index, extruder index within
   one toolhead, or material tray with `InvalidStatusError(<field>[i].<key>, 'duplicate')`; `'duplicate'` is added
   to `InvalidStatusReason`. One `Set` per list (a fresh one per toolhead for extruders), so the check stays linear.
   Tests: four refusal cases (`heaters[1].id`, `toolheads[1].index`, `toolheads[0].extruders[1].index`,
   `materials[1].tray`), and the 200-seed property test now also checks that appending a copy of the first heater
   is refused with `duplicate`. The hostile Proxy fixture returned `index: 0` for every item, which the new check
   rightly refused; it now returns `index: Number(key)`, and its read counts are unchanged.
2. Truncations in `mergeStatus`: the result's truncations are the new ones plus every base truncation whose
   top-level field (the name before the first `[` or `.`) the patch left alone, deduped on field and reason. "Left
   alone" means the patch field is absent or is the same value as the base's (`===`), so `merge(s, s)` stays identity.
   New test: a 300-char `vendorState` keeps its `tooLong` cut through `merge(s, s)` (all of `s` is equal) and through
   `merge(s, {state:'busy'})`, and `merge(s, {vendorState:'ok'})` clears it.
- Verified: `pnpm test` 39/39 (5 files; status.test.ts has 21), `pnpm lint` clean, `pnpm build` ok,
  `node scripts/run.mjs checks` 0 failures.
- Not done: a patch that sends an equal but new list (another array with the same items) counts as setting the
  field, so the base cut on that list is dropped. The coordinator lines above (domain/index.ts export, CHANGELOG)
  still apply.

**Review failed (sp9-rerev-prn-4)** (2026-10-26)

Ran: `pnpm test` 39/39 (5 files), `pnpm lint` clean, `pnpm build` ok, `node scripts/run.mjs checks` 0 failures (82
pass). Mutations in a `mktemp -d` copy of the module, each run against `test/status.test.ts`:
- `unique` made a no-op: 5 tests fail (property + the four per-list refusals). One extruder Set shared across
  toolheads: the property test fails. So point 1 of the previous FAIL is fixed and tested. The check is linear: 10^6
  heaters with the same id are refused at `heaters[1].id` after reading two items.
- Base truncations dropped entirely, the `===` clause removed, or all base truncations kept: each fails the new
  merge test. So the fix is tested for the case it covers.
- Survivors (minor): removing the dedupe filter (`status.ts:315`) passes every test, and so does using the whole
  `t.field` instead of its top-level name (`:310`), because the test only covers a top-level `vendorState` cut.

Point 2 is still broken for the patches adapters actually send. The rule "drop a base cut when the patch sets its
top-level field" (`status.ts:310-311`) is right for the fields a patch replaces (`vendorState`, `notifications`,
`position`, `job: null`), but `heaters`, `toolheads`, `materials` and `job` are merged, so setting them keeps the cut
data and should keep the cut. Probe (base with 70 heaters and a 5,000-char `job.file`, truncations
`[heaters tooMany, job.file tooLong]`):
- `mergeStatus(s, {heaters:[{id:'h0',current:200}]})`, a normal temperature push: `heaters tooMany` is gone, though
  the list is still the cut 64.
- `mergeStatus(s, {job:{progress:50}})`, a normal progress push: `job.file tooLong` is gone, though `job.file` is
  still the cut 4,096 chars.
Moonraker and Bambu send these every second, so a cut disappears on the first push. That is the bug the previous
review asked to fix ("hides the cut from consumers"); the fix only works when the patch leaves the field out or sends
back the same object.

On the `===` refinement: it is enough for `merge(s, s)` identity, but it compares references, and adapters build a
new array for every push, so the known limit (an equal list in a new array drops the cut) is the common case, not an
edge case. The structural rule below removes the need for `===`.

Fix expected, `vsslicer/modules/printer-api/src/domain/status.ts:306-312`: drop a base truncation only when the patch
replaces what was cut: `vendorState`, `notifications`, `position` when set (non-undefined), `job` when `null`, and
`job.file` when `patch.job.file` is set. Keep `heaters`, `toolheads` and `materials` list cuts (`tooMany`, and
`<list>[i].<field>` string cuts unless the patch item with that key sets that field), since `byKey` keeps every base
item. Then drop the `===` clause and the dedupe filter if it stays dead. Tests: a heater temperature push keeps
`heaters tooMany`, a `job.progress` push keeps `job.file tooLong`, `job: {file:'x'}` clears it, and a
`toolheads[0].extruders` cut survives a toolhead push (this also kills the `:310` survivor).

The rest of the card still holds as the previous review found (types, H2C fixture, bounds, purity, hostile-array
cost). Coordinator note unchanged: `src/domain/index.ts` must export `status.ts`.

sp9-prn-4-fix2 (2026-10-26), the sp9-rerev-prn-4 fix as specified:

- `mergeStatus` now drops a base truncation only when the patch replaces what was cut, via a new `replaces()`
  that walks the cut's field path (`status.ts`, above `mergeStatus`): `vendorState`, `notifications`, `position`
  whenever set; `job` only on `job: null` or a set `job.file`; keyed lists (`heaters`, `toolheads`,
  `toolheads[i].extruders`, `materials`) keep their `tooMany` cut always, and a `<list>[i].<field>` cut goes only
  when the patch item with the base item's key sets that field (never for the key field itself). Patch lists are
  scanned up to the same cap + 1 as `byKey`. The `===` clause is gone.
- The dedupe filter stays and is now live and tested: a base `heaters tooMany` plus a fresh one from a push that
  adds a heater past the cap give a single entry.
- Behaviour change: `merge(s, s)` no longer keeps a `vendorState` cut (a sent vendorState replaces it, as the
  review specified); the existing test now asserts that. The 200-seed property test has no cuts and still holds.
- New test `merge keeps list and merged-object cuts through routine pushes`: heater temperature push keeps
  `heaters tooMany`; `job.progress` push keeps `job.file tooLong`; `job:{file:'x'}` and `job:null` clear it; a
  toolhead push keeps `toolheads[0].extruders tooMany` and `toolheads[0].extruders[1].nozzleType`, which only a push
  setting extruder 1's `nozzleType` clears; same for `materials[0].type`.
- Verified: `pnpm test` 40/40 (5 files), `pnpm lint` clean, `pnpm build` ok, `node scripts/run.mjs checks` exit 0.
  Mutations (restored afterwards): dedupe made a no-op, and treating every keyed-list cut as a list cut, each fail
  the new test.
- Not done: no shared-file edits; the coordinator lines above (domain/index.ts export, CHANGELOG) still apply.

**Review failed (sp9-rerev2-prn-4)** (2026-10-26)

Ran: `pnpm test` 40/40 (5 files, status.test.ts 21), `pnpm lint` clean, `pnpm build` ok, `node scripts/run.mjs
checks` exit 0. Mutations in a `mktemp -d` copy, each against `test/status.test.ts`: dedupe made a no-op, any key
match clears the cut, key match ignored, list `tooMany` dropped, every `job` push clears `job.file`, `job: null`
kept, list scan limit 0, all base cuts kept: each fails 1-2 tests. So the sp9-rerev-prn-4 fix is in and tested: a
heater push keeps `heaters tooMany`, `job.progress` keeps `job.file tooLong`, `job:{file}` and `job:null` clear it,
a toolhead push keeps `toolheads[0].extruders tooMany` and the extruder item cut, dedupe and index/key path matching
are live. One survivor (minor): removing `name === key ||` (`status.ts:301`) passes every test; no test has a cut on
a key field (`heaters[i].id`, `materials[i].tray`).

Bounds of `replaces()`: paths come from `base.truncations`, which only `createPrinterStatus` writes, so depth is at
most 5 and the walk recurses only into keyed lists and `job`. Each base cut scans at most cap + 1 patch items. Probe:
a base with 1,363 cuts (300 materials and 70 heaters with long ids and strings, 20x20 extruders) merged with a 10^7
Proxy `materials` patch reads 197,633 items (769 material cuts x 257 + 257) in about 50 ms; heaters 4,225 reads,
toolheads 8,993. Bounded by the caps, not by patch length. A hand-made base with a 10^6-char, 10^5-segment field
path merges in 4 ms. Fine.

The card's property does not hold as the card states it. "Merging full over full is identity" holds only for
statuses without cuts (the 200 seeds have none). Probe, `JSON.stringify(mergeStatus(s, s)) === JSON.stringify(s)`:
false for a 300-char `vendorState`, for 300 notifications, for a 5,000-char notification message, and for a 5,000-char
`job.file` (all of them lose the cut); true for `heaters tooMany` and a `heaters[0].id` cut. So the break is wider
than the `vendorState` case the worker recorded: `job.file` and every `notifications` cut break it too. This comes
from my predecessor's spec ("replaced whenever set", "drop the `===` clause"), not from the worker: `===` was wrong
for keeping keyed-list cuts, but it is right for replaced values. A patch that sends the same value as the base still
holds the cut value, so the cut should stay. Adapters push raw data, and an over-long raw value gets a fresh cut
anyway, so keeping the cut on an equal value costs nothing.

Fix expected, `vsslicer/modules/printer-api/src/domain/status.ts:306`: for a field that is replaced (not a keyed
list), keep the base cut when the patch value is the base value: `v === null` replaces it; `job` with a sub-path
recurses as now; otherwise replace only if `v !== b` (a string compare for `vendorState` and `job.file`, a reference
compare for `notifications`). Then `merge(s, s)` is identity for every status again. Tests: change the
`status.test.ts:210` expectation to keep the cut; add seeds with cuts to the property test (over-long `vendorState`,
`job.file`, a notification message, more than 256 notifications) so `merge(s, s)` equals `s` for them;
`merge(s, {vendorState:'ok'})` and `merge(s, {notifications:[...s.notifications]})` (a new array) still clear. Also
add a key-field cut (a 300-char heater id) that survives a push to another heater, which kills the `:301` survivor.

Note, not a defect of this round: a heater whose id was cut cannot be patched with its raw id. `mergeStatus(s,
{heaters:[{id: <the same 300-char id>, current: 5}]})` throws `heaters[1].id: duplicate`, because `byKey` compares
the raw id with the cut one and appends it. That is a refusal on hostile-size ids, not data loss. Record it under
"Not done" or match on the cut key.

The rest of the card still holds (types, H2C fixture, bounds, duplicate refusal, purity, hostile-array cost).
Coordinator note unchanged: `src/domain/index.ts` must export `status.ts`.

**Carried to SP10 (sp9-coordinator, 10:41):** its third review failed at 10:39 (truncation identity, see above) and SP9 stopped building. The unreviewed work is parked, untracked, under `.ai/local/wip/SP9/` at the same paths (vsslicer/modules/printer-api/src/domain/status.ts, test/status.test.ts); move it back with `mv` before continuing. Nothing of it is committed.
