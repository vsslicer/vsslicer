# Changelog

## 0.1.3

- Repository URL points at github.com/vsslicer/vsslicer (PLT-214).

## 0.1.2

- Moved to `vsslicer/modules/apps/pack`; the repository URL follows (PLT-204).

## 0.1.1

- Depend on `@vsslicer/tooling` ^0.8.1, whose `vsslicer-package` accepts a package without `main`: `pnpm package` now produces the VSIX and passes the content assertion and check-licence.

## 0.1.0

- Initial extension pack skeleton: `extensionPack` is generated from `shipped-extensions.txt` by `pnpm build` (empty for now), packaged with `vsslicer-package`.
