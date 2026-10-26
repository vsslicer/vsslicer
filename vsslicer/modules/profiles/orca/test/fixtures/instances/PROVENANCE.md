# Printer instance fixtures

| Folder / file                                      | Kind                   | App / version                      | Origin                                                                                                                           |
| -------------------------------------------------- | ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `orca-documented/user/default/machine/*.json`      | documented layout      | OrcaSlicer 2.5.0-dev (`@09aa0114`) | Invented user machine presets in the layout `Preset::save` writes (diff against the parent, `from: User`). Credentials are fake. |
| `../bundles/bambu-studio-saved-presets/` (printer) | real preset, by bundle | Bambu Studio 02.08.02.61           | The machine preset Bambu Studio saved; the test reads it out of that bundle as `user/<id>/machine/<name>.json`.                  |

Not saved by OrcaSlicer: the capture machine (OrcaSlicer 2.5.0-dev installed) has no user machine presets, its data
folder belongs to a signed-in Orca cloud account (a saved preset would sync), and the CLI (`--load-settings
--export-settings`) only resolves presets inside a loaded bundle and writes a flattened project config, not a user
preset. Capture one by hand (Printer settings, Print Host upload, Save) and add it as `orca-saved/`.

Key names and defaults come from OrcaSlicer@09aa0114b4e145b89cd61015d8cdf29dbc15b008 (AGPL-3.0); no upstream code is
copied.
