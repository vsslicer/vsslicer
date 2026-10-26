# Provenance

Synthetic user presets (hand-built, ~1 KB each) under the macos per-user layout; the folder stands for the user's home directory. No upstream bytes.
Layouts cited: OrcaSlicer@09aa0114 and BambuStudio@79df7ae `src/libslic3r/PresetBundle.cpp` (user presets in `<data_dir>/user/<user id>/{process,filament,machine}`, `default` before sign-in); PrusaSlicer@30ef591 and SuperSlicer (`<data_dir>/{print,filament,printer}/*.ini`); Cura@5bea2f8 `cura/CuraApplication.py:383` (`quality_changes` etc. under the versioned resource folder).
Base paths: Library/Application Support (slicers), Library/Application Support/cura/5.8 (Cura). Licence: AGPL-3.0-or-later.
