# VSSlicer Example

Sample VSSlicer extension: the reference for module layout, bundling, the third-party notices and the VSIX package. It contributes two commands.

- `VSSlicer: Hello` shows a greeting.
- `VSSlicer: Open Sample Webview` opens a webview whose script posts a `ready` message.

Licensed `AGPL-3.0-or-later`; bundled third-party packages are listed in `THIRD-PARTY-NOTICES.md`.

## Package

```sh
pnpm build && pnpm package
```
