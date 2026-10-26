# Provenance

| Tree         | Upstream                                                | Commit                                     | Path read                      | Files  | Licence                                                                                            |
| ------------ | ------------------------------------------------------- | ------------------------------------------ | ------------------------------ | ------ | -------------------------------------------------------------------------------------------------- |
| `data/orca`  | [OrcaSlicer](https://github.com/OrcaSlicer/OrcaSlicer)  | `09aa0114b4e145b89cd61015d8cdf29dbc15b008` | `resources/profiles/**/*.json` | 14,420 | AGPL-3.0 only (`README.md:260`: "licensed under the GNU Affero General Public License, version 3") |
| `data/bambu` | [Bambu Studio](https://github.com/bambulab/BambuStudio) | `79df7ae309be398ed30c9f397c13c9911c2edc57` | `resources/profiles/**/*.json` | 3,589  | AGPL-3.0 only (`README.md:43`)                                                                     |

Both are the clones in `.reference/repos`; the commits are in `source.commit`. Files are byte-identical to
upstream (`node scripts/regenerate.mjs` copies; `tree.sha256` pins the result, see `test/data.test.ts`).
Licence evidence is also in `../profile-api/PROVENANCE.md`.

## Included and excluded

Included: every `.json` file under `resources/profiles` (the `<Vendor>.json` manifests at the top level and
the machine, process and filament profiles below). Excluded: all other file types, which are bed models and
textures fetched on first use (card PRF-41): `.png` (452 Orca, 152 Bambu), `.stl`/`.STL` (282 Orca, 70 Bambu),
`.svg` (221 Orca, 10 Bambu), 2 `.py` (Bambu) and 1 `.py` (Orca), 1 `.3mf` and 1 extensionless file (Orca). No script is copied
or run. The regenerate script refuses symlinks, paths leaving the clone, and files over 16 MiB.
