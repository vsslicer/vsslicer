---
id: 111
title: "Spike: the .curaprofile layout from a file saved by Cura 5.x"
type: spike
priority: P1
effort: S
model: opus
area: [importers]
story: US46
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [121, 135]
created: 2026-10-25
---

The layout is unverified (`profiles.md` Comparison); this settles it from a real Cura 5.x file (kept as the module's fixture) or moves the format to E57.

**Code:** `vsslicer/modules/profiles-cura/docs/spikes/curaprofile.md` (module: `profiles-cura`, layer: n/a (spike notes))

## Acceptance criteria

- [x] A real `.curaprofile` saved by Cura 5.x (version recorded) is inspected and its structure written down
- [x] Decision: implement in this epic, or defer to E57 with the reason; if deferred the two Cura cards below are closed with that note

## Tasks

- [ ] Save a profile from Cura (not done: Cura is not installed here; files saved by Cura 5.x users were used instead, see Progress)
- [x] Document the layout
- [x] Decide

## Progress

2026-10-26, sp12-prf-111 (Opus):

- Cura is not installed on this machine, so no profile was saved locally. Instead seven real `.curaprofile` zips
  saved by Cura 5.x users were pulled from public GitHub repos (commit hashes in the spike doc): four with
  `setting_version = 20` (Cura 5.0-5.2), three with 21 (Cura 5.3), mapped through
  `Cura@5bea2f8:plugins/VersionUpgrade/*/__init__.py`. The file records no Cura minor version, only
  `setting_version`.
- Fixture kept: `vsslicer/modules/profiles-cura/test/fixtures/curaprofile/jeremy_petg_06_super_fast.curaprofile`
  (unmodified, MIT, from `blakadder/sv06@6cb9918`, setting_version 20), with `PROVENANCE.md` holding the source,
  sha256 and the MIT notice. The others have no licence or GPL-3.0 and are not vendored.
- Layout written down in `vsslicer/modules/profiles-cura/docs/spikes/curaprofile.md`: flat STORED zip, 1980
  dates, `0o600 << 16` attributes, one global entry (no `position`) and one per extruder (`position`,
  `intent_category`), entry name = container id (can contain spaces, `#n`, `(`, `,` and `/`), UTF-8 LF
  `.inst.cfg` with `[general] version = 4`, `[metadata] type = quality_changes, quality_type, setting_version`,
  `[values]` overrides. Also: Cura's reader upgrades only on a `version` change and its registry refuses a
  different `setting_version` (from code, unverified at run time); relevant to PRF-112's version diagnostic.
- `docs/research/profiles.md` Comparison: the `.curaprofile (unverified)` cell now states the verified layout and
  points at the spike doc.
- **Decision: implement in E18.** PRF-112 and PRF-113 stay open (nothing moves to E57): the layout is small and
  identical across the seven files, and the PRF-131 archive reader already reads all of them.
- Probes, criterion by criterion:
  - AC1: a scratch script (in `mktemp -d`, deleted) ran `readCuraProfileArchive` + `parseInstCfg` from `src/`
    by absolute path over all seven files: all read, two entries each, `position` absent on global and `0` on
    extruder, `read(write(read(x)))` equals `read(x)`. `unzip -Z -v` on Cura's bytes against our writer's: only
    the external attributes differ (0 vs `0o600 << 16`), which PRF-113 needs for byte-equal re-export.
    Every layout claim in the doc was checked with `unzip -Z -v` across all seven (method, version 2.0, no comment,
    no CR bytes).
  - AC2: decision recorded above and in the doc's "Decision" section; no cards closed since nothing is deferred.
  - No code changed, so there is no mutation probe; no new test (the fixture's import test belongs to PRF-112).
- Verified in `vsslicer/modules/profiles-cura` (macOS, Node 24): `pnpm lint` clean, `pnpm test` 193/193 (11 files),
  `pnpm build` ok; `node scripts/run.mjs checks` exit 0, runner tests 84/84. Prettier run on the two new md files.

Release lines: none (spike notes and a test fixture only; nothing exported).

**Review passed (sp12-rev-prf-111)**

2026-10-26, Opus. Read the card, the spike doc, `PROVENANCE.md`, the `profiles.md` diff and the raw notes.

- Ran in `profiles-cura`: `pnpm install` ok, `pnpm build` ok; `pnpm lint` fails only on prettier in
  `src/adapters/download/fetch.ts` and `pnpm test` is 192/193 with the one failure in `test/fetch.test.ts`
  ("unsafe name definitions/ab is refused"): both are PRF-130's in-flight files (in doing), not this card's.
  `node scripts/run.mjs checks` fails only on `modules/3mf/src/adapters/bambu/readPlates.ts` (ported-copyright),
  another card's work. Runner tests 84/84. Prettier clean on this card's two new md files.
- AC1: fixture sha256 `0c3cca4e...f5ea5` and 1455 bytes match `PROVENANCE.md`; `unzip -Z -v` confirms two STORED
  entries, 1980-01-01, version 2.0, ext attrs `0o600 << 16`, no comment, no CR, `[general] version = 4`,
  `setting_version = 20`, `position` only on the extruder. Re-fetched two of the six non-vendored files
  (`oernster/tronxy...@29a85b2`, `muschaw/...@281d091`): same layout, the tronxy global id really contains `/`,
  setting_version 20 and 21 as stated. Scratch vitest (deleted) over the three files: reader takes all, two entries,
  global without `position`, extruder `position = 0`, `read(write(read(x)))` equals `read(x)`.
- Upstream cites checked in `.reference/repos` (Cura@5bea2f8, Uranium@e65ccc1): CuraProfileWriter.py:25-31,
  CuraProfileReader.py reader/upgrade lines, CuraContainerRegistry.py:94-100 / 261-272 / 298-302 / 507-514,
  QualityManagementModel.py:255-258, ContainerRegistry.py:727-738, CuraApplication.py:145 `SettingVersion = 27`,
  `InstanceContainer.Version = 4`, and all eight VersionUpgrade `quality_changes` rows; CPython 3.15.1
  `_open_to_write` sets `0o600 << 16` when the attributes are 0. All match.
- AC2: decision (implement in E18, PRF-112/113 stay open) recorded with reasons; nothing to close.
- Licence: Cura/Uranium LGPL-3.0 read only, no code ported; fixture is MIT with the notice kept.
- No code changed, so no mutation probe applies.
- Fixed in place (wording only): the doc said our writer differs from Cura's bytes only in the external
  attributes; for Unix-saved files (tronxy) the "made by" OS byte differs too (byte diff at central header +5),
  now stated. `PROVENANCE.md` said `files` lists `dist` only; it also lists `LICENSE` and `README.md`.
