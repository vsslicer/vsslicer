# @vsslicer/webview-kit

Webview plumbing shared by VSSlicer extensions. Three entry points:

- `@vsslicer/webview-kit/host`: extension-host side (Node); imports nothing browser-only.
- `@vsslicer/webview-kit/webview`: webview side (browser); imports nothing from `vscode`.
- `@vsslicer/webview-kit/gl`: WebGL helpers (browser).

Each exports `TRANSPORT_SCHEMA_VERSION`, the version of the host/webview message envelope.
The transport (PLT-32) and GL code (PLT-34, PLT-41) are not here yet.
