# VSSlicer

Extension pack: installing it installs the VSSlicer extensions. It has no code of its own.

- Extension id `vsslicer.vsslicer`, display name "VSSlicer", publisher `vsslicer`.
- Contents: the ids in `shipped-extensions.txt` (currently none; `vsslicer.gcode` is next).

Licensed `AGPL-3.0-or-later`.

## Add an extension

Add its id as one line to `shipped-extensions.txt`, run `pnpm build` (writes `extensionPack` in `package.json`; `pnpm test` fails if the two differ), bump the version and add a CHANGELOG entry. Only list ids that are already published.

## Package

```sh
pnpm build && pnpm package
```
