# Changelog

## 0.0.3

- Dev: `@vsslicer/test-vscode` ^0.2.4 (software WebGL option for GPU-less CI). (PLT-225)

## 0.0.2

- Repository URL points at github.com/vsslicer/vsslicer (PLT-214).

## 0.0.1

- Moved to `vsslicer/modules/apps/slicer`; the repository URL follows (PLT-204).

## Unreleased

- SLC-278: `vsslicer.slicer.timeout` is bounded to 1..2147483 s and rounded, with a warning when changed.

## 0.0.0

- SLC-115: the `vsslicer` task type (slice, upload, print) with its definition schema and tasks.json entry validation.
- SLC-101: settings `vsslicer.slicer.engine`, `.orca.path`, `.cura.path`, `.timeout` and `.outputFolder`, read through a validating settings reader.
- Scaffold: activation, layer folders, one command, VSIX packaging. (SLC-100)
