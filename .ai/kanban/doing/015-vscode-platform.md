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

- [ ] Extension host limits documented: sandboxing, native modules (N-API, electron rebuild, platform-specific VSIX), worker threads, file size limits, memory, long-running processes, networking (TLS, MQTT, raw sockets), serial ports
- [ ] Webviews and custom editors: lifecycle, retainContextWhenHidden, CSP, local resource roots, message channel throughput, WebGL/WebGPU, multiple panels, editor groups
- [ ] Workspace model: multi-root, virtual file systems (`FileSystemProvider`), tree views, SCM integration, tasks; how a 3D printing project maps to it
- [ ] Forking: Code-OSS vs VSCodium build pipeline, `product.json` fields (marketplace, extension gallery, built-in extensions, branding, telemetry), code signing/notarisation, auto-update, release effort per platform
- [ ] Self-hosted marketplace: Open VSX server deployment, `extensionsGallery` config, publishing with `ovsx`, private registries, extension signing
- [ ] Alternatives assessed: Eclipse Theia, plain Electron app embedding Monaco, web-only VS Code (vscode.dev) constraints
- [ ] Decision table: for each product capability, extension-only vs needs fork, with reasons

## Tasks

- [ ] Read VS Code API docs, Code-OSS wiki, VSCodium docs, Open VSX docs; clone `microsoft/vscode` shallow if code reading is needed
- [ ] Survey extensions that ship native modules (serialport, sqlite) for packaging patterns
- [ ] Write the report

## Progress

Not started.
