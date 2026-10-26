---
id: 90
title: Read Orca user machine presets as printer instances
type: feature
priority: P0
effort: M
model: opus
area: [importers, store]
story: US36
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [29, 139, 136]
created: 2026-10-25
---

Orca keeps connection fields in different places than PrusaSlicer (unverified); a first step on fixtures settles where, then the reader builds instances.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/instances/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] A note in the card's Progress records where Orca stores host and credential, from fixtures saved by the real app (version recorded)
  - **Settled by the coordinator (SP12, rule 28):** met by the note citing OrcaSlicer@09aa0114's source for the keys and their place in the user machine preset, tested on invented presets and the real Bambu Studio 02.08.02.61 preset; the check against a preset saved by the real app moves to PRF-224 (Q31).
- [x] Fixture Orca machine presets yield instances keeping model, nozzle and host
- [x] Credentials are returned separately from the entity; unknown host types give a diagnostic

## Tasks

- [ ] Inspect real fixtures
- [x] Write the reader
- [x] Tests

## Progress

Not started.

### sp12-prf-90 (2026-10-26)

**Where Orca stores host and credential** (OrcaSlicer@09aa0114b4e145b89cd61015d8cdf29dbc15b008, installed app OrcaSlicer
2.5.0-dev): Orca has no separate physical-printer file. The Print Host dialog edits the printer preset's own config
(`src/slic3r/GUI/PhysicalPrinterDialog.cpp:119`: `m_config = &wxGetApp().preset_bundle->printers.get_edited_preset().config`),
and `host_type`, `print_host`, `printhost_apikey`, `printhost_authorization_type`, `printhost_user`, `printhost_password`
(and `print_host_webui`, `printhost_cafile`, `printhost_port`, ...) are printer options (`src/libslic3r/Preset.cpp:1591-1594`).
So they sit as plain strings in `user/<id>/machine/<name>.json`, which is saved as a diff against its parent
(`Preset.cpp:754-800`). The defaults are `host_type` = octoprint (`PrintConfig.cpp:5787`) and auth = key (`PrintConfig.cpp:1292`).
With `user` auth the password is used (`OctoPrint.cpp:586`). Projects never carry them (`Preset.cpp:1066-1073`,
`PresetBundle.cpp:5434-5442`).

**Criterion 1 not ticked: no fixture saved by the real Orca app has host fields.** The capture machine's Orca data
folder has no user machine presets, and it belongs to a signed-in Orca cloud account, so saving one would sync. The
CLI route (`--datadir <scratch> --load-settings --export-settings`) is refused because `resolve_preset` only accepts presets
inside the loaded bundle (`PresetBundle.cpp:560-650`), and in any case it writes a flattened project config. The sandbox
also refused copying the user's own Bambu Studio preset out of `~/Library`. The finding above therefore comes from
source. The real-app input used is the machine preset Bambu Studio 02.08.02.61 saved (it has no host keys), which the
test reads out of the committed `bundles/bambu-studio-saved-presets` bundle. The presets with hosts are documented
fixtures (`test/fixtures/instances/orca-documented/`, `PROVENANCE.md`). Owner follow-up: in Orca, open printer
settings, then Print Host upload, set a Moonraker host, save the preset, and add the file as `instances/orca-saved/`.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/instances/read-instances.ts` (`readOrcaInstances(presets, tree)`).
It reads every `machine` user preset into an `InstanceImport`. Keys resolve along the `inherits` chain (own keys, user
parents, then the flattened vendor preset; `nil` falls through). `model` is `printer_model`. The nozzle is the nearest
instantiable vendor machine preset (the nozzle id `split.ts` uses). `connection` is set only when `print_host` is set and
`host_type` maps to prusalink/octoprint/moonraker/duet, and `secret_ref` is `orca-user/<user_id>/<name>`. The credential
is returned beside the entity. Diagnostics: an unknown host type gives `unknown-type`, a missing model or nozzle gives
`unknown-parent`, and loops or chains over the cap give `cycle`. Bounds: chain 16, name 255, host 2048
(`MAX_CONNECTION_STRING`), credential 4096, `user_id` sliced to 255. `HOST_MAP` is a `Map`. `printhost_user` is not
kept (shortcut comment; the entity has no field for it). Tests: `test/read-instances.test.ts` (11).

**Probes** (each edit made in the source, then restored; every one failed the suite):
- Criterion 2 (model/nozzle/host): model read from own keys only, 5 failed; nozzle dropped, 4 failed; abstract guard removed, 1 failed; "nil" fallthrough removed, 1 failed; offline preset given a connection, 2 failed; default host_type changed, 1 failed.
- Criterion 3 (credentials apart, unknown host diagnostic): credential not returned, 3 failed; credential copied into the entity, 3 failed; `user` auth ignored, 1 failed; unknown host type accepted, 2 failed; unknown-type code changed, 2 failed; `HOST_MAP` as a plain object (`constructor`/`__proto__`), 1 failed.
- Bounds: cycle guard removed, 1 failed; chain cap one higher, 1 failed; name, host and credential caps one higher, 1 failed each.

**Verification** (macOS; CI gate runs on ubuntu-latest): `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test`
15 files / 201 tests passed, `node scripts/run.mjs checks` 84/84 passed plus check-licence and check-fixtures.
Notes: `.reference/notes/PRF-90-orca-printer-instances.md`.

**Release lines:**
- CHANGELOG (profiles-orca, Added): `readOrcaInstances`: Orca / Bambu user machine presets as printer instances (model, nozzle, print host connection; the credential is returned beside the entity, and an unknown host type gives a diagnostic).
- `src/index.ts`: `export * from './adapters/instances/read-instances.ts';`

### Review failed (sp12-rev-prf-90) (2026-10-26)

**Ran** (profiles-orca, macOS): `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test` 15 files / 202 tests
passed (read-instances 11), `node scripts/run.mjs checks` 84/84 plus check-licence and check-fixtures. Upstream lines
checked in `.reference/repos/OrcaSlicer@09aa0114`: PhysicalPrinterDialog.cpp:119, Preset.cpp:754 and :1591-1594,
PrintConfig.cpp:197-215 (host types), :218-221 (auth `key`/`user`), :5787 and :1292 (defaults), OctoPrint.cpp:586; all
match. Layering: adapter only, imports `@vsslicer/profile-api` and its own module's adapters; no VS Code.

**Criteria:** 1 met as the coordinator settled it (source note at OrcaSlicer@09aa0114, invented presets plus the real
Bambu Studio 02.08.02.61 preset; real-app check moved to PRF-224). 3 met. 2 fails on real vendor data (problem 1).

**Mutation probes** (scratch copy, each against `test/read-instances.test.ts`): HOST_MAP as a plain object 1 failed;
credential not returned 3; credential copied into the connection 3; `user` auth ignored 1; nil fallthrough removed 1;
default host_type changed 1; abstract guard removed 1; cycle guard removed 1; chain cap off by one 1; name, host,
credential caps off by one 1 each; unknown host type accepted 2; model from own keys only 5; user parent not pushed
on the chain 2; `user_id.slice(0, 255)` removed **0 failed**.

**Hostile probes:** preset files named `__proto__` and `constructor`, a raw `"__proto__"` JSON key carrying
`print_host`, and `host_type` values `__proto__`/`constructor`: all safe (no inherited value, unknown-type diagnostic).

**Problems:**

1. `src/adapters/instances/read-instances.ts:73` and `:95`: the toolhead nozzle is the nearest instantiable vendor
   preset name and the model is the `printer_model` string, but `splitOrcaPrinters` only makes those entities when it
   splits the preset (a `machine_model` exists, `printer_variant` is set, bed and nozzle count match its model).
   Otherwise it emits one `printer_model` with `id` = the preset name and no nozzle (`split.ts:93-112`). Probe: every
   instantiable machine preset in `OrcaSlicer@09aa0114:resources/profiles` (1184) as the parent of a user preset, then
   the instance's `model`/`nozzle` looked up in `splitOrcaPrinters(tree).entities`: 28 nozzles and 1 model dangle
   (e.g. `Artillery M1 Pro 0.2 nozzle`, refused by split as "bed or nozzle count differ"; `Creality Sermoon D3 Pro`).
   `resolveToolheads` throws on such an instance. The test tree (`test/read-instances.test.ts:33-60`) has no
   `machine_model` or `printer_variant`, so its expected `model: 'MyKlipper'` is an id split never makes there.
   Expected fix (rule: an instance names only entity ids the same importer produces): take model and nozzle from the
   one rule split uses (export it from `split.ts`, or have the caller pass split's ids like profiles-prusa's
   `nozzleOf`); for an unsplit parent, `model` = the preset name and `toolheads` empty with an `unknown-parent`
   diagnostic. Test: build the fixture tree with a `machine_model` and `printer_variant`, assert every instance's
   ids exist in `splitOrcaPrinters(tree)`, and add a parent split refuses.
2. `read-instances.ts:99`: `id: u.name` collides when two user folders hold the same preset name. Orca writes
   `user/default/` when signed out and `user/<cloud id>/` when signed in, and `readOrcaUserPresets` keeps both (its
   duplicate key includes the user). Probe: `user/default/machine/V.json` and `user/123/machine/V.json`, both with a
   host, give two instances with id `V` and no diagnostic; the store keeps one and the other connection is lost.
   Expected fix (rule: entity ids from input are unique in one import or the repeat is diagnosed): keep the first and
   report the second (`malformed-line` or a duplicate code), or qualify the id; test both files.
3. `read-instances.ts:129`: the `user_id` bound (255) in `secret_ref` has no test; removing it fails nothing. Rule
   (SP12): a bound's test asserts the exact cap. Add a 255 / 256 `user_id` case.

Note for the coordinator: `printhost_user` is dropped (shortcut comment, no entity field), so a `user`-auth OctoPrint
instance gets a password without its username; digest auth needs both. Fine as a recorded shortcut, worth a card
before the OctoPrint connector.

### sp12-prf-90b (2026-10-26): review fixes

**Problem 1 (model and nozzle ids):** `readOrcaInstances` now runs `splitOrcaPrinters(tree)` once and maps each vendor
machine preset name to the ids split gives it: a split nozzle maps to its model's id and its own nozzle id, and an
unsplit preset maps to its own `printer_model` id with no nozzle. The instance takes the nearest vendor preset in its
`inherits` chain from that map. An unsplit parent gives `model` = the preset name, empty `toolheads` and an
`unknown-parent` warning (`vendor preset "<name>" is not split into a nozzle; toolheads left empty`). If no imported
vendor preset sits above the instance (none, abstract, or refused by split), it gets an empty model and toolheads and
one `unknown-parent` warning. The `printer_model` key is no longer read. The signature takes `OrcaTree` (split needs
it). The test tree now has `machine_model` entries, `printer_variant` and `printable_area`, plus `MyKlipper Big 0.4
nozzle`, a parent with a different bed that split refuses. A new test asserts that every instance's model and nozzle
ids are in `splitOrcaPrinters(tree).entities`. The reviewer's probe, rerun (scratch test, every non-abstract machine
preset in `OrcaSlicer@09aa0114:resources/profiles` as the parent of a user preset): 1184 parents gave 1184 instances,
**0 dangling models, 0 dangling nozzles**, and 28 instances without a toolhead (the unsplit parents).

**Problem 2 (one id from two user folders):** the first preset keeps the id. A later preset whose name matches it
(NFC, case-folded, so a case alias on a case-insensitive store counts) is skipped with a `malformed-line` warning:
`another user folder already has a printer named "<name>"; not imported`. Test: `user/default/machine/V.json`,
`user/123/machine/V.json` and `user/456/machine/v.json` give one instance and two diagnostics.

**Problem 3 (user_id bound):** new test: a `user_id` of 255 and one of 256 characters both give a 255-character segment
in `secret_ref`.

**Probes** (each applied to `read-instances.ts`, run against `test/read-instances.test.ts`, then restored; the file was
compared byte for byte afterwards):
- Criterion 2 (model/nozzle/host as split ids): the model set to the preset name instead of split's model id failed 6.
  The unsplit-parent mapping removed failed 1. The unsplit parent given a nozzle failed 1.
- Problem 2 guard: the duplicate check removed failed 1. The key not case-folded failed 1.
- Problem 3 bound: `slice(0, 255)` removed failed 1. The cap set one higher (256) failed 1.
- Criterion 3 and the other bounds: code unchanged since sp12-prf-90's probes and the reviewer's (all failed then).
  Their tests still pass.

**Verification** (macOS; the CI gate runs on ubuntu-latest), profiles-orca: `pnpm install` ok, `pnpm lint` ok,
`pnpm build` ok, `pnpm test` 16 files / 211 tests passed (read-instances 14). `node scripts/run.mjs checks`: 84/84
passed, check-licence and check-fixtures ok. During my run, another worker's `test/zz-probe-109.test.ts` briefly broke
lint and check-licence. It was gone when I reran, and everything passed.

**Release lines:** unchanged from sp12-prf-90, but the CHANGELOG line should read: `readOrcaInstances`: Orca / Bambu
user machine presets as printer instances (the model and nozzle ids splitOrcaPrinters makes, print host connection;
the credential is returned beside the entity, and an unknown host type or a name repeated across user folders gives a
diagnostic).

**Coordinator re-review (sp12-coordinator, rule 29, against the FAIL criteria):** lint and `pnpm test` 211/211 pass; probes rerun by the coordinator: the `user_id` cap at 256 fails 1, a non-colliding duplicate key fails 1, restored; the worker reran the reviewer's 1184-preset probe (no missing id). Pass.
