# Orca and Bambu profile data: VSIX payload size (PRF-22)

Sources: OrcaSlicer@09aa0114 and BambuStudio@79df7ae, `resources/profiles/**/*.json` (licence AGPL-3.0 for both; shipping the data carries that licence, flag for the licensing decision). Measured 2026-10-26 on macOS, `zip` (Info-ZIP), copies in a scratch dir, nothing run from `.reference`.

## Method

Copied only `*.json` (tree layout kept) into scratch dirs. `zip -9 -r` and `zip -6 -r` (vsce's zip is per-file deflate, level 6 default, so `-6` is the VSIX figure: vsce 3.9.2 zips with yazl, which creates `new zlib.DeflateRaw()` with no level, i.e. zlib's default 6, `yazl@2.5.1:index.js:148`). Also: minified JSON, and tar.gz / tar.xz as a what-if for one-archive packing. A VSIX adds about 1 KB of manifest files.

## Results

| Tree | JSON files | Uncompressed | zip -9 | zip -6 (vsce default) |
|---|---|---|---|---|
| Orca | 14,420 | 24,535,560 B (23.4 MiB) | 11,200,800 B (10.7 MiB) | 11,213,422 B (10.7 MiB) |
| Bambu | 3,589 | 6,821,989 B (6.5 MiB) | 2,624,149 B (2.5 MiB) | 2,629,488 B (2.5 MiB) |
| Both | 18,009 | 31,357,549 B (29.9 MiB) | 14,016,735 B (13.4 MiB) | 14,034,696 B (13.4 MiB) |

Orca's biggest vendors (disk KB): BBL 10.9 MB, Qidi 7.3 MB, Creality 6.8 MB, OrcaFilamentLibrary 5.5 MB, Prusa 3.4 MB. Non-JSON assets (png/stl/svg, 700+ files) were left out.

What-ifs, both trees:

| Packing | Size |
|---|---|
| zip -9, JSON minified (per-file) | 13,467,966 B (12.8 MiB), only 4 % smaller |
| tar + gzip -9 (one stream) | 2,638,401 B (2.5 MiB) |
| tar + xz -9 (one stream) | 1,198,028 B (1.1 MiB) |

Per-file deflate wastes most of the redundancy: the profiles inherit from each other and repeat the same keys, but deflate's 32 KB window never crosses a file boundary. A single archive inside the VSIX (a `.tar.gz`, which the VSIX zip then stores at about 2.6 MB) is 5 times smaller, at the cost of an unpack or streaming reader at runtime.

## Budget

- PLT-21 budget: `"vsslicer": {"sizeBudgetKB": 200}` is required per extension; larger fails `vsslicer-package` (CONTRIBUTING.md "VSIX package", `.reference/notes/PLT-21-vsix-packaging.md`). The example extension is 17 KB.
- Hard limit of the registry: Open VSX default `ovsx.publishing.max-content-size` is 512 MB (`openvsx@373af42:doc/configuration.md:36-41`). The 13.4 MiB zip fits easily; the open-vsx.org live value and VS Code Marketplace limit are unverified.

## Decision

**Ship the data as a separate data extension (`vsslicer.profiles-data`, built from the module that owns the import), not inside `vsslicer.profiles`.**

1. 14.0 MB per-file zip is about 70 times the 200 KB budget; even the best case (tar.xz, 1.2 MB) is 6 times over. Raising the code extension's budget to fit would turn the budget into a no-op.
2. The data changes on the slicers' cadence (new printers), the code on ours. Separate versions mean a profile refresh does not re-download the code, and the reverse. The data extension gets its own budget (propose 16384 KB for the per-file zip, or 4096 KB if packed as one `tar.gz`), set in its `package.json`.
3. `vsslicer.profiles` declares an `extensionDependencies`/optional lookup on it, and works without it (user profiles, project profiles). This also keeps the AGPL data out of the code extension's package.
4. Packing: start with plain per-file JSON (simple, 13.4 MiB, within Open VSX limits). Switch to a single `.tar.gz` (2.5 MiB) only if install size or update bandwidth becomes a problem; that is a follow-up card, not needed for the decision.

Caveats: only the two trees were measured, not Prusa/Cura/Super data; per-platform download time not measured; bytes are with `zip` on macOS, vsce's own zip library may differ by a few KB.
