# Changelog

## Unreleased

- SLC-278: `vsslicer.slicer.timeout` is bounded to 1..2147483 s and rounded, with a warning when changed.

## 0.0.0

- SLC-115: the `vsslicer` task type (slice, upload, print) with its definition schema and tasks.json entry validation.
- SLC-101: settings `vsslicer.slicer.engine`, `.orca.path`, `.cura.path`, `.timeout` and `.outputFolder`, read through a validating settings reader.
- Scaffold: activation, layer folders, one command, VSIX packaging. (SLC-100)
