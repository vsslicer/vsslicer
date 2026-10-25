# Changelog

## 0.1.1

- Depend on `@vsslicer/tooling` ^0.8.1, whose `vsslicer-package` accepts a package without `main`: `pnpm package` now produces the VSIX and passes the content assertion and check-licence.

## 0.1.0

- Initial extension pack skeleton: `extensionPack` is generated from `shipped-extensions.txt` by `pnpm build` (empty for now), packaged with `vsslicer-package`.
