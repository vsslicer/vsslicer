---
id: 15
title: VS Code platform: fork vs extension
type: spike
priority: P0
effort: L
area: [platform]
milestone: R1
owner: worker-opus
created: 2026-10-25
---

What VS Code gives us and what we would have to fork for, including shipping our own marketplace.

Report: `docs/research/vscode-platform.md`. Notes: `.reference/notes/VSS-15-vscode-platform.md`.

## Acceptance criteria

- [x] Extension host limits documented: sandboxing, native modules (N-API, electron rebuild, platform-specific VSIX), worker threads, file size limits, memory, long-running processes, networking (TLS, MQTT, raw sockets), serial ports
- [x] Webviews and custom editors: lifecycle, retainContextWhenHidden, CSP, local resource roots, message channel throughput, WebGL/WebGPU, multiple panels, editor groups
- [x] Workspace model: multi-root, virtual file systems (`FileSystemProvider`), tree views, SCM integration, tasks; how a 3D printing project maps to it
- [x] Forking: Code-OSS vs VSCodium build pipeline, `product.json` fields (marketplace, extension gallery, built-in extensions, branding, telemetry), code signing/notarisation, auto-update, release effort per platform
- [x] Self-hosted marketplace: Open VSX server deployment, `extensionsGallery` config, publishing with `ovsx`, private registries, extension signing
- [x] Alternatives assessed: Eclipse Theia, plain Electron app embedding Monaco, web-only VS Code (vscode.dev) constraints
- [x] Decision table: for each product capability, extension-only vs needs fork, with reasons

## Tasks

- [x] Read VS Code API docs, Code-OSS wiki, VSCodium docs, Open VSX docs; clone `microsoft/vscode` shallow if code reading is needed
- [x] Survey extensions that ship native modules (serialport, sqlite) for packaging patterns
- [x] Write the report

## Progress

Done. Extension host limits, webviews and custom editors, workspace model, Code-OSS/VSCodium forking and `product.json`, self-hosted Open VSX, Theia and other alternatives, and the fork-vs-extension decision table; vscode 4ef6bab7, vscodium be70704, openvsx 373af42. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: WebGPU in webviews (deferred to VSS-7), postMessage throughput and extension-host memory limit need a running VS Code; release-effort figures are estimates.
