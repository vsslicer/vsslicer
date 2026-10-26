# Spike: the .curaprofile layout (PRF-111)

2026-10-26, sp12-prf-111. Raw notes: `.reference/notes/PRF-111-curaprofile-layout.md` (ignored).

## Sources

- Fixture: `test/fixtures/curaprofile/jeremy_petg_06_super_fast.curaprofile`, from
  `blakadder/sv06@6cb9918:docs/files/jeremy_petg_06_super_fast.curaprofile` (MIT; see `PROVENANCE.md`).
  `setting_version = 20`, so it was saved by Cura 5.0, 5.1 or 5.2; the exact minor is not recorded in the
  file (Cura writes no application version into it).
- Six more Cura 5.x files from public GitHub repositories, inspected but not kept (no licence, or GPL-3.0):
  `sclebo05/KobraNeoProfiles@0e470d7` and `@745337c` (`CuraProfiles/AKNeo-*.curaprofile`, setting_version 21,
  Cura 5.3), `isakkjerstad/nnvs-cr-10-smart-pro-printer@34bf0ec:CR-10_Smart_Pro.curaprofile` (20),
  `oernster/tronxy-klipper-vzbot-guide@29a85b2:curaprofiles/tronxy-x5sa-PLA.curaprofile` (20),
  `muschaw/Marlin-2.1.2.1-For-X1-EasyThreeD@281d091:X1-V1.curaprofile` (21),
  `Eyreon/FLsun-V400@2bbc753:Non scraping profile for Cura 5.3.curaprofile` (20).
- Cura is not installed here, so no file was saved locally; the files above were saved by Cura users.
- Code: `Cura@5bea2f8` and `Uranium@e65ccc1` (LGPL-3.0), read only.

setting_version to Cura release (`Cura@5bea2f8:plugins/VersionUpgrade/*/__init__.py`, the `quality_changes`
row): 20 = 5.0-5.2 (`VersionUpgrade413to50:21`), 21 = 5.3 (`VersionUpgrade52to53:22`), 22 = 5.4-5.6
(`VersionUpgrade53to54:22`), 23 = 5.7-5.8 (`VersionUpgrade56to57:22`), 24 = 5.9 (`VersionUpgrade58to59:22`),
25 = 5.10-5.11 (`VersionUpgrade59to510:21`), 26 = 5.12 (`VersionUpgrade511to512:21`), 27 = 5.13
(`VersionUpgrade512to513:21`; `cura/CuraApplication.py:145` `SettingVersion = 27`). Release spans between
upgrade plugins are inferred from the plugin names.

## Layout (all seven files agree)

**Container:** a plain ZIP, no directories, no manifest, no comment. One entry per quality_changes container,
STORED (method 0), version needed 2.0, general-purpose flags 0, date and time 1980-01-01 00:00 (the zip epoch),
external attributes `0o600 << 16` (`?rw-------`), "made by" FAT or Unix depending on the saving OS. This is
`CuraProfileWriter.py:25-31` (`ZipFile(..., ZIP_DEFLATED)` but `writestr(ZipInfo(profile.getId()), ...)`, so
CPython keeps the ZipInfo's STORED and 1980 defaults; `ZipFile._open_to_write` fills in `0o600 << 16` when the attributes are 0; read in the local CPython 3.15.1
`zipfile/__init__.py:1851-1852`).

**Entries:** exactly two for a single-extruder printer: the global container first, then one per extruder.
Entry name = container id = `<base id>_<profile name, lower-cased, spaces to "_">`, plus ` #<n>` when the id was
taken (`Cura@5bea2f8:cura/Machines/Models/QualityManagementModel.py:255-258`, `Uranium@e65ccc1:UM/Settings/ContainerRegistry.py:727-738`).
The base id is the machine definition id for the global container and the extruder stack id for the extruder.
Names seen: `creality_ender3pro_overture_petg #2`, `creality_base_extruder_0_overture_petg #2`,
`custom_cr-10_smart_pro_(fine,_pla)`, `tronxy_x5sa/x5st/pro/2e_400mm_empty #2`. So ids carry spaces, `#`,
parentheses, commas and **`/`** (the tronxy file); a reader must treat the name as an opaque id, never as a path.

**Content:** UTF-8 `.inst.cfg` text, LF line ends, three sections:

```
[general]      version = 4, name = <display name>, definition = <machine quality definition>
[metadata]     type = quality_changes, quality_type = <e.g. standard>, setting_version = <n>
               extruder entries add: position = <0-based extruder>, intent_category = default
[values]       only the user's overrides; values as Cura stores them (`False`, `True`, `[90,0]`,
               `z_seam_corner_weighted`, `=` formulas allowed)
```

Both entries carry the same `name`, `definition` and `quality_type`. `definition` is the machine's quality
definition (`fdmprinter` for printers without machine qualities), on the extruder entry too. Key order inside
`[metadata]` varies between files (it is the container's dict order), so it must not be relied on. The global
entry has no `position`; Cura's importer uses exactly that to tell them apart and sorts extruders by `position`
(`Cura@5bea2f8:cura/Settings/CuraContainerRegistry.py:261-272`).

## Import behaviour in Cura (from the code, not run)

- Every entry is read as UTF-8 and named by its id (`CuraProfileReader.py:41-46`). A non-zip file falls back to
  one bare `.inst.cfg` (Cura 2.1, `:54-58`).
- Upgrades run only when `[general] version` differs from 4 (`CuraProfileReader.py:78-84`). A version-4 file with
  an older `setting_version` is not upgraded on this path, and `CuraContainerRegistry.addContainer` refuses an
  instance container whose `setting_version` is not the running one (`CuraContainerRegistry.py:94-100`). Whether
  Cura 5.13 therefore refuses a 5.0 file in practice is (unverified): not run here.
- The profile's `definition` is rewritten to the active machine's quality definition
  (`CuraContainerRegistry.py:298-302`), and `quality_type` must exist for that machine (`:507-514`).

## Probe against profiles-cura (2026-10-26)

A scratch script imported `src/adapters/archive/curaprofile-archive.ts` and `src/adapters/definitions/inst-cfg.ts`
by absolute path and ran them over all seven files: every file reads (two entries each, global without
`position`, extruder with `position = 0`), every entry parses, and `read(write(read(x)))` equals `read(x)`.
`writeCuraProfileArchive` output differs from Cura's bytes only in the external attributes (0 instead of
`0o600 << 16`, `unzip -Z -v`) and, for files saved on Unix, the "made by" OS byte (FAT from our writer); entry
order, names, method, dates and data are byte-equal. Adding
`0o600 << 16` to the writer would make an unmodified fixture re-export byte-identically (PRF-113's criterion).

## Decision

**Implement in E18** (PRF-112 import and PRF-113 export stay open; nothing moves to E57). The layout is small,
stable across the 5.x files seen, and the guarded archive layer (PRF-131) already reads every real file.
Remaining work for PRF-112: map the global and extruder entries (by `position`) into user quality entities,
carry `quality_type` as the parent quality, and give a diagnostic when `setting_version` is not the target's.
For PRF-113: write the same two-entry layout with ids built as above, and set the `0o600 << 16` attributes.
