# VS Code platform: fork vs extension

Researched 2026-10-25 (VSS-15). Code read at:

| Repo | Commit | Notes | Licence |
|---|---|---|---|
| microsoft/vscode | `4ef6bab7` (2026-10-25) | Code-OSS 1.144.0 (`package.json:3`), Electron 43.8.3 | MIT |
| VSCodium/vscodium | `be70704` (2026-10-14) | build scripts; 41 top-level `.patch` files, 69 recursively (`ls patches/*.patch \| wc -l`; `find patches -name '*.patch' \| wc -l`) | MIT |
| eclipse/openvsx | `373af42` (2026-10-25) | server, CLI, web UI | EPL-2.0 |

Web sources: the VS Code extension API docs, the Code-OSS wiki, the VS Code FAQ, the Open VSX wiki and docs, Theia docs, and the serialport and better-sqlite3 docs. Each is cited inline. Raw notes are in `.reference/notes/VSS-15-vscode-platform.md`. Findings about code are true at the commits above. VS Code ships monthly, so recheck line numbers before relying on them.

**Bottom line.** Every product capability VSSlicer needs can ship as extensions on stock VS Code and on VSCodium. A fork pays only for branding, a default gallery, bundled extensions and proposed-API allowlisting. Ship extensions first, publish to both the VS Marketplace and Open VSX, and treat a VSCodium-style rebrand as optional packaging late in the roadmap. The decision table is in [Decision table](#decision-table).

## Findings

### 1. Extension host limits

| Topic | Finding | Source |
|---|---|---|
| Process model | Desktop extensions run in a Node.js extension host. Electron starts it as a `UtilityProcess`. One host per window, shared by all extensions in that window `(inference: not stated in the docs; follows from each window running its own workbench and extension service)`. `extensions.experimental.affinity` can move extensions into separate host processes. | `vscode@4ef6bab7:src/vs/platform/extensions/electron-main/extensionHostStarter.ts`; `src/vs/workbench/contrib/extensions/browser/extensions.contribution.ts:269`; `src/vs/workbench/services/extensions/common/extensionRunningLocationTracker.ts:167`; https://code.visualstudio.com/api/advanced-topics/extension-host |
| Sandboxing | `(inference)` Node extensions are not sandboxed: the docs describe the local host as a Node.js runtime, with no permission model, so extensions get full Node access (fs, `child_process`, `net`, `dgram`, `tls`, `worker_threads`) with the user's privileges. The documented restricted runtime is the web extension host, a browser WebWorker. | https://code.visualstudio.com/api/advanced-topics/extension-host ; https://code.visualstudio.com/api/extension-guides/web-extensions |
| Extension kinds | UI extensions run locally. Workspace extensions run where the workspace lives: remote over SSH, WSL, containers or Codespaces. Hardware access (serial, USB, LAN printers) must declare `extensionKind: ["ui"]`, or it ends up on the remote machine. | https://code.visualstudio.com/api/advanced-topics/remote-extensions |
| Native modules | The Electron ABI is pinned per release: `target="43.8.3"`, `runtime="electron"` (`vscode@4ef6bab7:.npmrc:2-4`). The remote server uses Node 24.22.1 (`remote/.npmrc:2`). A module built against the NAN or V8 ABI must be rebuilt for each VS Code Electron bump. N-API modules (serialport ≥10) are ABI-stable across Electron versions. VS Code unpacks its own `*.node` files to `node_modules.asar.unpacked` (`build/gulpfile.vscode.ts:269-301`). | https://serialport.io/docs/guide-installation/ |
| Platform-specific VSIX | Supported since VS Code 1.61. Targets are `win32-x64`, `win32-arm64`, `linux-x64`, `linux-arm64`, `linux-armhf`, `alpine-x64`, `alpine-arm64`, `darwin-x64`, `darwin-arm64` and `web`, built with `vsce package --target <t>`. A package without a target is the fallback. `ovsx` supports the same targets. | https://code.visualstudio.com/api/working-with-extensions/publishing-extension#platformspecific-extensions ; `openvsx@373af42:cli/README.md:84-112` |
| Worker threads | Node `worker_threads` work in the Node host, because it is plain Node inside Electron. VS Code core spawns workers itself (node-pty `conoutSocketWorker.js`, `build/gulpfile.vscode.ts:280`). Web extensions get only WebWorkers. Worker use by extensions is `(unverified)` against a documented guarantee. | as cited |
| Large files | Text documents over 50 MB are not synced to extensions (`TextModel._MODEL_SYNC_LIMIT`, `src/vs/editor/common/model/textModel.ts:188,368`). Large-file mode starts at 20 MB or 300K lines (`textModel.ts:189-190`). G-code regularly exceeds both, so read it with `vscode.workspace.fs` or Node `fs` streams inside a custom editor, never as a `TextDocument`. | as cited |
| Memory | No per-extension memory quota is documented. The extension host has one V8 heap shared by every extension in the window. Heavy work (slicing, G-code parsing) belongs in a child process or worker, so a crash or out-of-memory error cannot take down every extension. `(unverified: default heap size)` | — |
| Responsiveness and shutdown | The workbench marks a blocked host as unresponsive (`src/vs/workbench/services/extensions/common/abstractExtensionService.ts:855`). On shutdown, `deactivate()` gets at most 5 s (`src/vs/workbench/api/common/extHostExtensionService.ts:269-270`). | as cited |
| Long-running processes | `child_process.spawn` is allowed, and the process lives as long as the extension host, which means as long as the window. A second window gets a second host, so a printer connection or print-job monitor would be duplicated. For connections that must survive one window, run a detached local daemon that windows attach to over a socket. | design consequence of the per-window host above |
| Networking | Node `net`, `tls`, `dgram` and `http(s)` are available, so MQTT over TLS (Bambu LAN), WebSocket (Moonraker), HTTP (OctoPrint, PrusaLink) and UDP/mDNS discovery work from the host. VS Code patches `http`/`https` for proxies through `@vscode/proxy-agent` (`package.json:126`). Raw/ICMP sockets need OS privileges, as in any Node process. Webviews only get `fetch` and WebSocket under their CSP, with `local-network-access` allowed (`webviewElement.ts:432`). Web extensions only get `fetch` and WebSocket, and HTTPS pages block mixed content `(unverified for LAN printers)`. | as cited |
| Serial ports | There is no VS Code serial API. Use `serialport` (N-API prebuilds) in a UI-kind Node extension. Webviews do not get WebSerial or WebUSB: the iframe `allow` list is `cross-origin-isolated; autoplay; local-network-access; clipboard-*` (`src/vs/workbench/contrib/webview/browser/webviewElement.ts:432-436`). | https://serialport.io/docs/guide-installation/ |
| Proposed APIs | Proposed APIs are unavailable to installed extensions unless they are listed in `product.json#extensionEnabledApiProposals` or VS Code is started with `--enable-proposed-api` (`src/vs/workbench/services/extensions/common/extensionsProposedApi.ts:43-112`). Extensions using them should not be published to the Marketplace. This is one real advantage of a fork. | https://code.visualstudio.com/api/advanced-topics/using-proposed-api |

### 2. Webviews and custom editors

| Topic | Finding | Source |
|---|---|---|
| Lifecycle | A webview's context is destroyed when it is hidden, unless `retainContextWhenHidden` is set. That option has "high memory overhead", and scripts are suspended while hidden (`vscode.d.ts:10070-10080`). Prefer `getState`/`setState` for cheap persistence, and `WebviewPanelSerializer` to restore across restarts. | https://code.visualstudio.com/api/extension-guides/webview |
| Kinds | `createWebviewPanel` (`vscode.d.ts:11547`); `registerWebviewViewProvider` for sidebar and panel views (`:11752`); `registerCustomEditorProvider` (`:11791`). | as cited |
| Custom editors | `CustomTextEditorProvider` uses a TextDocument model. `CustomReadonlyEditorProvider` and `CustomEditorProvider` use the extension's own model and fire edit events to get dirty state, undo/redo, save, backup and hot exit. `supportsMultipleEditorsPerDocument` defaults to false. | https://code.visualstudio.com/api/extension-guides/custom-editors |
| CSP | The outer host page is locked down (`default-src 'none'`, `pre/index.html:7`). Inner content should declare a CSP using `webview.cspSource`. VS Code warns when no CSP is present (`pre/index.html:933-940`). | https://code.visualstudio.com/api/extension-guides/webview#content-security-policy |
| Local resources | Only files under `localResourceRoots` load, through `asWebviewUri`. Workspace folders and the extension directory are the defaults. Put `.3mf` and `.gcode` folders on the list or stream bytes over messages. | https://code.visualstudio.com/api/extension-guides/webview#loading-local-content |
| Sandbox flags | The iframe gets `allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads` (`webviewElement.ts:430`). Pointer lock helps orbit controls in the 3D viewer. There is no `allow-popups`. | as cited |
| Message channel | `postMessage` is asynchronous and JSON-serialised. ArrayBuffers travel as `SerializableObjectWithBuffers` (`src/vs/workbench/api/common/extHostWebview.ts:221`), so binary meshes and G-code chunks avoid JSON. No throughput figure is published: `(unverified)`, benchmark in the viewer spike. | as cited |
| WebGL/WebGPU | Webviews are Chromium iframes in Electron 43. WebGL2 versus WebGPU availability and the renderer choice are analysed in VSS-7 (`docs/research/3d-viewer.md` §1 and its Open questions); this report defers to it. | `docs/research/3d-viewer.md` |
| Multiple panels and groups | Panels open in any `ViewColumn` and editor group and can be moved by the user. Each webview is its own iframe and process context, so several viewers mean several WebGL contexts and more memory. | https://code.visualstudio.com/api/extension-guides/webview |
| Remote | In remote setups, webview content loads through VS Code's resource proxy. Local HTTP servers, such as a camera MJPEG proxy, need `env.asExternalUri` (`vscode.d.ts:10927`). | https://code.visualstudio.com/api/advanced-topics/remote-extensions |

In the webview content frame, host messages are posted by the outer frame (`vscode@4ef6bab7:src/vs/workbench/contrib/webview/browser/pre/index.html:1305`), but VS Code's injected script then sets `window.parent = window`, `window.top = window` and `window.frameElement = null` (`pre/index.html:252-254`). So `event.source === window.parent` is **always false** for host messages; measured in 1.143.1 (PLT-31, §8). Check `event.origin === location.origin` instead.

### 3. Workspace model

| API | What it gives | Source |
|---|---|---|
| Multi-root | `workspace.updateWorkspaceFolders` (`vscode.d.ts:13952`). A `.code-workspace` file holds several folders and settings. | vscode.d.ts |
| `FileSystemProvider` | `registerFileSystemProvider(scheme, …)` (`vscode.d.ts:14517`) mounts any scheme into the Explorer, editors and search. Two candidates: `printer://<name>/` to browse files on a Moonraker/OctoPrint/SD card, and `3mf://` to expose a 3MF zip's parts, plates and config as a folder. | vscode.d.ts |
| Tree views | `createTreeView` (`:11703`): printers, filament inventory, profile inheritance trees, and plates and objects inside a project. | vscode.d.ts |
| SCM | `scm.createSourceControl` (`:16677`). It is not needed for git, which works natively on profiles and projects. A custom provider could show profile diffs against the vendor bundle. Low priority. | vscode.d.ts |
| Tasks | `registerTaskProvider` (`:9359`): "slice", "upload" and "print" as tasks with problem matchers for slicer warnings. A task can also chain a CLI slicer. | vscode.d.ts |
| Watchers and decorations | `createFileSystemWatcher` (`:14079`) re-slices when a profile changes. `registerFileDecorationProvider` (`:11835`) marks sliced or stale files. | vscode.d.ts |

Mapping a 3D printing project to this model: the workspace folder is the project. `*.3mf`, `*.stl` and `*.step` files open in a custom editor (the 3D viewer with plates). `*.gcode` and `*.bgcode` files open in a read-only custom editor (preview and simulation). Profiles are JSON/INI files in the workspace or global storage, edited as text with schemas or through a webview form. Printers and filament are tree views backed by a daemon. Printer storage is a `FileSystemProvider`. Slicing is a task or command.

### 4. Forking: Code-OSS vs VSCodium

**What Microsoft adds on top of Code-OSS.** Trademarks and icons, Marketplace URLs, extension recommendations, telemetry endpoints, are added to `product.json` or the distro and are not in the repository (https://github.com/microsoft/vscode/wiki/Differences-between-the-repository-and-Visual-Studio-Code). Closed native components are also loaded at runtime but not shipped in the repository: `@vscode/vsce-sign` (`vscode@4ef6bab7:src/vs/platform/extensionManagement/node/extensionSignatureVerificationService.ts:70`) and `vsda`, which VSCodium has to patch out (`vscodium@be70704:patches/00-remote-remove-missing-vsda.patch`). The Code-OSS `product.json` has no `extensionsGallery` (`vscode@4ef6bab7:product.json:1-80`).

**`product.json` fields that matter.**

| Field | Purpose | Evidence |
|---|---|---|
| `nameShort`, `nameLong`, `applicationName`, `dataFolderName`, `urlProtocol`, `darwinBundleIdentifier`, `win32*AppId`, `win32MutexName`, context-menu CLSIDs | Branding and side-by-side install identity | `vscode@4ef6bab7:product.json:2-7`; `vscodium@be70704:prepare_vscode.sh:68-110` |
| `extensionsGallery` {`serviceUrl`, `itemUrl`, `controlUrl`, `extensionUrlTemplate`, `resourceUrlTemplate`, `nlsBaseUrl`} | Marketplace endpoint | `vscode@4ef6bab7:src/vs/base/common/product.ts:147-155`; VSCodium sets it to Open VSX at `prepare_vscode.sh:39` |
| `builtInExtensions` [{name, version, sha256, repo, metadata}] | Extensions downloaded and bundled at build time | `product.json:40-56`; `build/lib/builtInExtensions.ts:46` |
| `extensionEnabledApiProposals` | Grants proposed APIs to named extensions | `product.ts:256` |
| `updateUrl`, `quality`, `commit`, `downloadUrl` | Auto-update | `src/vs/platform/update/electron-main/abstractUpdateService.ts:33-34,206` |
| telemetry keys | Absent in OSS. VSCodium additionally strips telemetry (`undo_telemetry.sh`, `patches/00-telemetry-disable.patch`). | `prepare_vscode.sh:247` |
| `webviewContentExternalBaseUrlTemplate` | Webview content origin (vscode-cdn.net) | `product.json:39` |

**Build pipelines.**

| | Code-OSS (Microsoft) | VSCodium |
|---|---|---|
| Source | `microsoft/vscode` plus closed distro mixin | Upstream tag plus 41 top-level `.patch` files in `patches/` (69 including OS/channel subfolders) (branding 172 KB, Copilot removal 208 KB, GitHub-release updater 31 KB, custom keymap/policy/osproxy libs) |
| CI | Azure Pipelines (`build/azure-pipelines/product-build.yml`) | GitHub Actions, one workflow per OS and channel (`.github/workflows/publish-stable-*.yml`) |
| Toolchain | Node, Python, Rust (CLI), C++ toolchains | node (`.nvmrc`), jq, git, python3 3.11, rustup, plus X11/secret/krb5 libraries on Linux (`docs/howto-build.md`) |
| macOS signing | ESRP (internal) | p12 import, `codesign`, `xcrun notarytool submit --wait` (`build/osx/prepare_assets.sh:3-48`). Needs an Apple Developer ID (US$99/yr). |
| Windows signing | ESRP (`build/azure-pipelines/win32/steps/product-build-win32-sign.yml`) | SignPath GitHub action (`publish-stable-windows.yml:190-197`). Needs an OV/EV certificate or SignPath OSS sponsorship. |
| Linux | deb, rpm, snap, tar | deb, rpm, AppImage, snap, tar across x64, arm64, armhf, loong64, ppc64le, riscv64 (`build/linux/`) |
| Auto-update | Squirrel.Mac (`updateService.darwin.ts:25`, requires a signed app), Inno Setup on Windows (`updateService.win32.ts:44-63`), Linux notifies and opens `downloadUrl` (`updateService.linux.ts:62-80`) | Same code, pointed at GitHub releases (`patches/11-update-use-github-release.patch`, `prepare_vscode.sh:54`) |
| Extension signatures | Verified with the closed `@vscode/vsce-sign` (`src/vs/platform/extensionManagement/node/extensionSignatureVerificationService.ts:70`) | Disabled by patch (`patches/00-extension-disable-signature-verification.patch`) |

**Release effort `(estimate, unverified)`.** VS Code ships about monthly. A downstream fork must rebase its patches and rebuild 3 OSes × 2–3 architectures for every release, and for security point releases too. VSCodium automates this with GitHub Actions, yet it still carries 41 top-level patches (69 recursively). Minimum ongoing cost for us: an Apple Developer ID, a Windows signing certificate, CI minutes for about 6–8 build targets of 30–60 min each, and a person to rebase on each upstream release. Microsoft-licensed extensions (C/C++, Python, Remote-*, Live Share) are not usable in forks (`vscodium@be70704:docs/extensions-compatibility.md`; https://code.visualstudio.com/docs/supporting/faq). For VSSlicer users, many of whom are also developers, that is a real loss.

### 5. Self-hosted marketplace

| Topic | Finding | Source |
|---|---|---|
| Server | Spring Boot server plus a separate web UI image, or a custom React UI through the `openvsx-webui` npm library. Needs PostgreSQL and Elasticsearch, or database search, and OAuth2 for login. Storage can be local disk, Azure, GCS or AWS. Docker images are available, as is a `docker-compose.yml`. | `openvsx@373af42:doc/deployment.md`; `doc/configuration.md` (File Storage, Search) |
| Upstream and mirror | An upstream registry lets local misses fall through to open-vsx.org. A private instance can hold our extensions and still serve the public catalogue. Full mirror mode also exists. | `doc/deployment.md` (Upstream Registry Instance); `doc/mirror.md` |
| Size limits | `ovsx.publishing.max-content-size` plus per-namespace and per-extension overrides. Matters if we bundle a slicer engine (tens of MB per target). | `doc/configuration.md:76-112` |
| Client config | Set `product.json#extensionsGallery` at build time. VSCodium also accepts `VSCODE_GALLERY_*` environment variables or a user `product.json` in its config directory. Stock VS Code has no supported user-level override. | `vscodium@be70704:docs/extensions.md:33-63`; `patches/00-settings-gallery.patch`, `00-settings-user-product.patch` |
| UUIDs | VS Code needs stable extension UUIDs for auto-update. Open VSX fetches them from an upstream gallery, or else generates random ones. | `doc/configuration.md:623-633` |
| Publishing | `ovsx create-namespace`, then `ovsx publish [vsix] -p $OVSX_PAT`, with per-target publishing through `--target`. Trusted publishing (GitHub/GitLab OIDC, no long-lived PAT) exists since server 1.2.0. On open-vsx.org you need an Eclipse account and must sign the Publisher Agreement. Verified namespace ownership is claimed by a public issue on `EclipseFdn/open-vsx.org`. | `cli/README.md:21,65,84-112`; `doc/configuration.md:1376+`; https://github.com/eclipse/openvsx/wiki/Publishing-Extensions ; https://github.com/eclipse/openvsx/wiki/Namespace-Access |
| Signing | Open VSX can generate a key pair and a per-version signature archive (`ovsx.integrity.key-pair: create\|renew\|delete`). `ovsx verify` checks a VSIX offline. VS Code itself verifies signatures with `@vscode/vsce-sign` against Microsoft's chain, and VSCodium disables verification altogether. Registry signing therefore protects `ovsx`-based tooling, not the editor's install path, unless the fork adds its own verifier. | `doc/configuration.md:871-879`; `cli/src/verify-signature.ts:30`; see §4 |
| Extension control | A nightly job processes a malicious/deprecated list; VSCodium points `controlUrl` at EclipseFdn's list. | `doc/configuration.md:845+`; `prepare_vscode.sh:39` |
| Alternatives | `coder/code-marketplace`: a single Go binary with no UI or publishing flow that serves VSIX files from storage. | `vscodium@be70704:docs/extensions.md:65-80` |
| Microsoft Marketplace terms | The Marketplace serves only Visual Studio family products, so a fork must not point at it. Publishing our own extensions to it is fine and reaches stock VS Code users. | https://github.com/microsoft/vscode/wiki/Differences-between-the-repository-and-Visual-Studio-Code ; https://aka.ms/vsmarketplace-ToU |

### 6. Alternatives

| Option | What it is | Fit for VSSlicer | Source |
|---|---|---|---|
| Eclipse Theia | A separate IDE framework (EPL-2.0 / GPL-2.0-with-classpath) that runs VS Code extensions "up to and including" a declared API version. Some APIs are stubbed. It uses Open VSX. Electron and browser targets, and the product is fully white-label. | It runs our extensions with some API lag. It is worth having as a later white-label product, not as the base, because users would leave VS Code. | https://theia-ide.org/docs/user_install_vscode_extensions/ ; https://eclipse-theia.github.io/vscode-theia-comparator/status.html |
| Plain Electron app with Monaco | `monaco-editor` is only the text editor: no workbench, extension host, Explorer, tasks or marketplace. | It means rebuilding everything VS Code gives for free. It is the right shape only for a standalone slicer app, which is another product. | https://github.com/microsoft/monaco-editor `(licence MIT, not re-checked)` |
| Web-only (vscode.dev) | Browser WebWorker extension host only: no Node, terminal, debugger, native modules or child processes. Local folders need the File System Access API, which only Chrome and Edge support. | It can host the viewer and G-code preview as `web`-target extensions (WASM parsing, WebGL). It cannot slice natively, open serial ports, open raw MQTT/TCP, or reach LAN printers from an HTTPS origin without a relay. | https://code.visualstudio.com/docs/setup/vscode-web ; https://code.visualstudio.com/api/extension-guides/web-extensions |
| Self-hosted web (code-server, openvscode-server) | A Node server plus browser UI. Extensions run on the server. | It works for a print-farm or Raspberry Pi deployment, where the host is next to the printers. Hardware access is on the server. | `(unverified, not researched in depth)` |

### 7. WebGPU and workers in webviews, measured (PLT-33)

Measured 2026-10-25 with a probe extension. Its webview HTML came from `createWebviewHtml` in `@vsslicer/webview-kit@0.4.2/host`, unchanged, and a control variant dropped `blob:` from `worker-src`. `@vsslicer/test-vscode@0.2.3` ran it on VS Code 1.100.0 (Electron 34.5.1, Chrome 132.0.6834.210) and 1.143.1 (Electron 43.7.7, Chrome 150.0.7871.250). Versions are from the webview's `navigator.userAgent` and the extension host's `process.versions`. Raw results and the probe source are in `.reference/notes/PLT-33-webgpu-workers-probe.md`. Windows and Linux with a real GPU are not measured yet (asked on the board, Q15).

| Check | macOS 27.2, Apple M1 Pro | Linux arm64 container, Xvfb, no GPU |
|---|---|---|
| `'gpu' in navigator` | true | true |
| `requestAdapter()` | adapter `apple`, `common-3` (1.100) / `metal-3` (1.143), not fallback; `requestDevice()` ok, `maxBufferSize` 256 MiB | `null` on both versions, no exception |
| WebGL2 | ANGLE Metal, Apple M1 Pro | 1.100: SwiftShader, with Chromium's warning that automatic software WebGL fallback is deprecated; 1.143: **no context** |
| `isSecureContext` / `crossOriginIsolated` / `SharedArrayBuffer` | true / false / absent | same |
| `new Worker(blob:)`, classic and `type: 'module'` | ok; `navigator.gpu` and `OffscreenCanvas` exist inside | ok |
| `new Worker(asWebviewUri(...))` | `SecurityError`: the script on `https://file+.vscode-resource.vscode-cdn.net` "cannot be accessed from origin `vscode-webview://<id>`". This is the Worker same-origin rule, not CSP (no violation event) | same |
| `fetch(asWebviewUri)`, then a `blob:` URL, then a Worker | ok (`connect-src` allows the fetch) | ok |
| `new Worker(data:)` | refused, `worker-src` violation | same |
| Control: `worker-src` without `blob:` | every `blob:` form refused with a `worker-src blob` violation | same |

What follows:

- **Workers.** The kit's `worker-src <cspSource> blob:` is needed and is enough. Without `blob:`, no worker can start, because `asWebviewUri` scripts are cross-origin to the webview, so `blob:` is the only way in. A worker bundle ships as a file under `localResourceRoots`. The webview fetches it and starts it from a `blob:` URL, or inlines it as a string at build time. A module worker from a `blob:` URL cannot resolve relative imports (inference, not tested), so worker bundles must be self-contained. The `cspSource` part of `worker-src` (`'self' https://*.vscode-cdn.net`) matches nothing a Worker can load, but it does no harm.
- **WebGPU.** It works in a stock VS Code webview with no flags on macOS, from 1.100 on. On a machine without a GPU, `navigator.gpu` is still present but `requestAdapter()` resolves to `null`. Feature detection must await the adapter; checking that `navigator.gpu` exists is not enough. The Chromium Linux rollout (Intel Gen12+ since Chrome 144, NVIDIA on Wayland since 147, per `3d-viewer.md` §2) is unverified in Electron until the owner runs the probe on a Linux GPU.
- **WebGL2 baseline (D6).** On Chrome 150 with no GPU there is no WebGL2 context at all, which confirms the risk in `3d-viewer.md` §2. GPU-less VMs, containers and CI cannot render, so the viewer needs a visible "no GPU" state. A headless Linux integration test (Xvfb, no GPU) cannot test rendering.
- `crossOriginIsolated` is false, so `SharedArrayBuffer` is absent in webviews on both versions, as `3d-viewer.md` §2 assumed.

### 8. Bulk transfer to a webview: messages versus `fetch(asWebviewUri)`, measured (PLT-31)

Measured 2026-10-25 on macOS 27.2, Apple M1 Pro (GPU: ANGLE Metal, Apple M1 Pro), 16 GB, VS Code 1.143.1 (Electron 43.7.7, Node 24.21.0), with a probe extension run by `@vsslicer/test-vscode@0.2.3` and `@vsslicer/webview-kit@0.4.2`'s `sendBuffer`, `receiveBuffers` and `createWebviewHtml`. Three runs per cell, 50, 200 and 500 MiB of deterministic bytes. Each run gets a fresh panel. A position-dependent checksum is compared in the webview: all 81 checksummed runs matched, and the 9 count-only runs got the right length. Time is from the host's first send (or posting the URL) until the webview holds every byte. Memory is the peak RSS of VS Code's process tree, sampled with `ps` in a loop (50 ms pause plus the time `ps` takes), minus the value just before the run. Memory figures are noisy (the median of 3 is given) because garbage from the previous run is still being collected. Other VS Code instances (another worker's gcode-preview tests) were running on the same machine during the measurements, which adds noise to the timings. Windows and Linux are not measured yet (board Q16). Raw rows are in `.reference/notes/PLT-31-results-darwin.jsonl`, and the probe source and run commands are in `.reference/notes/PLT-31-probe.md`.

| Method | 50 MiB ms | 200 MiB ms | 500 MiB ms | 500 MiB MB/s | 500 MiB peak RSS delta, MiB (renderer / ext host) |
|---|---|---|---|---|---|
| kit `sendBuffer`, 256 KiB chunks, window 16 | 114 | 371 | 1032 | 508 | 640 (543 / 260) |
| kit, 1 MiB, window 4 (current `TRANSFER_DEFAULTS`) | 102 | 319 | 748 | 701 | 1286 (679 / 587) |
| kit, 4 MiB, window 4 | 90 | 246 | 658 | 797 | 1344 (580 / 596) |
| kit, 16 MiB, window 4 | 96 | 293 | 612 | 857 | 1353 (768 / 588) |
| kit, 16 MiB, window 2 | 88 | 313 | 766 | 684 | 1233 (659 / 405) |
| raw `postMessage`, 4 MiB chunks, no acks | 83 | 250 | 527 | 995 | 1097 (365 / 678) |
| raw `postMessage`, one message | 137 | 648 | 2618 | 200 | 649 (1026 / 387) |
| `fetch(asWebviewUri)`, then `arrayBuffer()` | 170 | 670 | 2069 | 253 | 247 (473 / 14) |
| `fetch`, `body.getReader()`, count bytes only | 114 | 414 | 1190 | 441 | 513 (537 / 0) |
| `fetch`, `body.getReader()`, checksum each chunk | 587 | 2305 | 5565 | 94 | 61 (64 / 0) |

The checksum alone costs about 11 ms per MiB on every method (5.4 s at 500 MiB), so the last row is limited by the consumer, not by the pipe. Writing the payload to a file first took 19, 83 and 196 ms. On the fetch side, `Range: bytes=1048576-2097151` returned `206` with exactly 1 MiB at every size.

What the code says, at `vscode@4ef6bab7`:

- **Messages.** `webview.postMessage` takes every `ArrayBuffer` and typed array out of the JSON and sends them as `VSBuffer`s (`src/vs/workbench/api/common/extHostWebviewMessaging.ts:22-50`, `extHostWebview.ts:129-135`). The main thread revives them and posts them into the frame with a transfer list (`api/browser/mainThreadWebviews.ts:66-73`, `contrib/webview/browser/pre/index.html:1305`). A typed-array **view** sends its whole underlying buffer (`extHostWebviewMessaging.ts:37-40`): posting `big.subarray(0, 1024)` sends all of `big`. The kit's `sendBuffer` slices each chunk into its own buffer (`webview-kit@0.4.2:src/application/transfer.ts:61-63`), so it never hits this.
- **Buffers become JSON when no extension is found.** This only happens when `shouldSerializeBuffersForPostMessage` holds, meaning `engines.vscode` is at least 1.57 (`extHostWebview.ts:170-177`). It is decided for the extension that `require('vscode')` resolves to. An extension without `main` is not in the path index (`extHostExtensionService.ts:370-374`), so it gets the null extension's API, and every `ArrayBuffer` arrives as `{}`. Measured: the probe's buffers arrived empty until it got a `main`. That matters for test extensions.
- **Resources.** `fetch(asWebviewUri)` is answered by `loadResource` (`contrib/webview/browser/webviewElement.ts:830-945`). It reads with `fileService.readFileStream` and gives the service worker a transferable `ReadableStream`, which honours `Range` with `206`. The stream enqueues each file chunk as it is read, without waiting on the reader's `desiredSize` (`webviewElement.ts:884-893`). The measured body chunks were 64 KiB, never larger.

What follows:

- **Bulk data that lives in a file goes by `fetch(asWebviewUri)` and is read incrementally.** That covers G-code, `.bgcode`, 3MF and the slicer's output files. Its memory stays flat only when the consumer is slower than the pipe (about 440 MB/s here): the checksumming reader peaked at about 64 MiB at 500 MiB, but the count-only reader peaked at 513 MiB (renderer 537 MiB), about the file size and more than `arrayBuffer()` (247 MiB), for a reason not yet known (Open questions). Either way it stays below the 1.1 to 1.4 GB of chunked messages. It costs the extension host nothing, and the parser overlaps with I/O, so the time to a parsed result is about the parser's own time. `Range` gives random access, for example a 3MF central directory or a G-code layer index. The file's folder has to be in `localResourceRoots` (the kit's `localResourceRoots` helper). It also has to be readable by the workbench file service, which holds in remote setups through the resource proxy, `(unverified for remote)`. The chunk size is VS Code's, 64 KiB, not ours. A consumer that wants bigger pieces collects them itself.
- **Bulk data the host makes in memory goes by the kit's `sendBuffer` with 4 MiB chunks and a window of 4.** That covers buffers parsed or generated in the extension host. 4 MiB is the fastest setting at 200 MiB and within 8 % of the fastest at 500 MiB. 16 MiB adds nothing reliable, and 1 MiB is about 15 to 30 % slower. Acknowledgements cost little: the unacknowledged raw variant is no faster at 200 MiB (250 against 246 ms) and 25 % faster at 500 MiB (995 against 797 MB/s), and it gives up backpressure. Throughput is 600 to 860 MB/s, against 200 MB/s for one 500 MiB message. Expect the RSS peak to be about 2 to 3 times the payload (2.2 times at 200 MiB, 2.7 times at 500 MiB for 4 MiB chunks), because the host slices copy and the receiver concatenates. A consumer that can take chunks one at a time, instead of `receiveBuffers`' concatenated buffer, would save one copy `(not measured)`.
- **Never send one big message.** At 500 MiB it is 4 times slower than chunking, and the renderer peaked at about 1 GiB.
- **Kit bug.** The webview `createWindowChannel` in `webview-kit@0.4.2` (`src/adapters/webview-window.ts`) accepts only messages whose `event.source === window.parent`. Because of `pre/index.html:252-254` that is false for every host message, so `receiveBuffers` and `handshake` over it never hear the host. Measured: `sendBuffer` timed out after 120 s. The probe used `event.origin === location.origin`, which works.

## Comparison

The decision table below, the build-pipeline table (§4) and the alternatives table (§6) serve as the comparison.

## Decision table

"Extension" means it works on stock VS Code and VSCodium through the public API. "Fork" means it needs our own build.

| Capability | Extension-only? | Needs fork? | Reason |
|---|---|---|---|
| 3MF project open, edit and save (plates, objects, modifiers) | Yes | No | `CustomEditorProvider` gives dirty state, undo/redo, save and backup; 3MF zip I/O works in Node or WASM |
| 3D model viewer (STL/3MF/STEP, WebGL) | Yes | No | Webview with WebGL2 and pointer lock (`webviewElement.ts:430`). Transfer meshes as ArrayBuffers. |
| WebGPU rendering | See VSS-7 | No | Whatever the webview supports is available to an extension; availability and the WebGL2 fallback are in `docs/research/3d-viewer.md`. |
| Slicer engine (CuraEngine/PrusaSlicer CLI or lib) | Yes | No | Spawn a per-platform binary from a platform-specific VSIX, or run WASM. Mind Open VSX size limits. |
| G-code preview and toolhead simulation (files over 50 MB) | Yes | No | Read-only custom editor that streams the file with `fs`. Do not use `TextDocument`: the 50 MB sync limit (`textModel.ts:188`). |
| G-code text editing, syntax, hovers | Yes | No | Language extension (TextMate grammar, hovers, diagnostics). Over 50 MB, the text editor still works but extension features are off. |
| Printer connectivity: Moonraker WS, OctoPrint/PrusaLink HTTP, Bambu MQTT/TLS | Yes | No | Node `net`/`tls`/WebSocket in a UI-kind extension |
| Persistent printer connections across windows | Yes, with a daemon | No | The host lives per window, so use a detached local daemon. A fork would not change this. |
| USB serial printers (Marlin) | Yes | No | `serialport` N-API prebuilds in a UI-kind extension. Ship platform-specific VSIX packages. No WebSerial in webviews. |
| Cameras (MJPEG/RTSP/WebRTC) | Yes | No | Webview `<img>`/`<video>`/WebRTC. Proxy RTSP through a daemon (ffmpeg) to `localhost`, then `asExternalUri`. |
| Printer file browsing | Yes | No | `FileSystemProvider` under the `printer://` scheme |
| Profiles (printer, filament, process) with inheritance | Yes | No | JSON schemas plus webview forms plus tree views. Profiles live in the workspace or `globalStorageUri`. |
| Filament inventory (Spoolman or local) | Yes | No | Tree view and webview. Local SQLite via `better-sqlite3` needs a rebuild per Electron ABI, so prefer WASM SQLite, an N-API module, or the Spoolman HTTP API. |
| Slice, upload and print as workflow steps | Yes | No | `registerTaskProvider`, commands, status bar, `withProgress` |
| Bundling all VSSlicer extensions as one install | Yes | No | Extension pack in the marketplace |
| Using proposed APIs (for example, unreleased editor or terminal APIs) | No | Yes, or wait for finalisation | Not publishable to the Marketplace. A fork can grant them through `extensionEnabledApiProposals` (`extensionsProposedApi.ts:43`). |
| Our own branding, icon, app name, splash, welcome page | Partly (themes, a walkthrough, a welcome webview) | Yes, for full branding | `product.json` names and icons plus the branding patch (VSCodium `00-brand-remove-branding.patch`) |
| Default extension gallery = our marketplace | No (stock VS Code is fixed to Microsoft) | Yes | `product.json#extensionsGallery`. VSCodium users can point at it with env vars or a user `product.json`, which is not a product. |
| Built-in, non-removable VSSlicer extensions | No | Yes | `product.json#builtInExtensions` |
| Removing unrelated UI (Copilot, SCM, debug) for a "printing-only" experience | Partly (profiles, settings, `workbench.*` toggles) | Yes, for true removal | VSCodium removes Copilot by patch (`53-ext-copilot-remove-it.patch`) |
| Installer signing, notarisation and auto-update for our app | Not needed with extensions (the marketplace delivers updates) | Yes, with ongoing cost | Apple ID and notarytool, a Windows certificate or SignPath, an update server (§4) |
| Extension signature enforcement for our registry | No | Yes, plus custom verifier code | Stock VS Code verifies only Microsoft signatures. VSCodium disables verification. |
| Web (vscode.dev) viewer and G-code preview | Yes (`web` target) | No | Browser extension host. No slicing, serial or LAN MQTT. |

## Implications for VSSlicer

1. **Extensions first (R1–R3).** Every capability is extension-only. Ship an extension pack plus focused extensions (project and viewer, G-code, printers and cameras, profiles, filament), published to both the VS Marketplace and open-vsx.org. That reaches VS Code, VSCodium, Cursor-style forks and Theia.
2. **One native-code policy.** Prefer WASM (slicer engine, SQLite, G-code parser) or N-API modules (serialport). Ship platform-specific VSIX packages for the 6–9 targets from a CI matrix. Avoid NAN/V8-ABI modules (better-sqlite3, older node-usb), which break on each Electron bump (`.npmrc:2`). Spawned binaries (CuraEngine, ffmpeg) avoid the ABI problem entirely.
3. **A local daemon** for printer connections, camera transcoding and job monitoring. It survives window reloads, avoids duplicate MQTT sessions per window, and keeps heavy work out of the shared extension host.
4. **Custom editors, not text documents,** for 3MF and G-code, because of the 50 MB sync limit and memory. Stream binary data to webviews as ArrayBuffers. Benchmark throughput in the viewer spike.
5. **Mark hardware extensions `extensionKind: ["ui"]`** so serial and LAN access stays on the user's machine under Remote-SSH and WSL.
6. **A fork is an optional late packaging step**, justified only by branding, a default gallery, built-in extensions or proposed APIs. If we do it, base it on VSCodium's scripts (MIT) and budget for monthly rebases, signing certificates and CI. Pointing it at an Open VSX instance with open-vsx.org as upstream keeps the public catalogue.
7. **Self-hosted Open VSX is not needed while open-vsx.org exists.** Reserve it for private or enterprise builds or a branded fork. Claim the verified `vsslicer` namespace on open-vsx.org early.
8. **Theia** is a possible later white-label target that needs no new code, if the extensions stay within Theia's supported API version. Check the comparator before using new APIs.

## Licence notes

- Code-OSS and VSCodium are MIT, so forking imposes no copyleft. Microsoft trademarks ("Visual Studio Code" and the icons) must not be used. Microsoft-licensed extensions are unavailable in forks (VS Code FAQ).
- The VS Marketplace Terms of Use forbid non-Microsoft products from using the Marketplace (https://aka.ms/vsmarketplace-ToU).
- Open VSX is EPL-2.0 (`openvsx@373af42:LICENSE`). Running it as a service imposes nothing on our extensions. Publishing to open-vsx.org requires the Eclipse Publisher Agreement.
- Theia is EPL-2.0 or GPL-2.0 with classpath exception `(not re-checked in code)`.
- Native dependencies: serialport is MIT and better-sqlite3 is MIT `(not re-checked)`. If our extensions bundle AGPL slicer code (PrusaSlicer, OrcaSlicer, BambuStudio), the AGPL governs that extension. Spawning an unmodified AGPL CLI as a separate process is the usual way to keep the extension's own licence. That is a legal question for VSS-5, not settled here.

## Open questions

- WebGPU availability in webviews: measured on macOS and on GPU-less Linux (§7). Windows and Linux with a GPU are still open (PLT-33, board Q15).
- `postMessage` versus `fetch(asWebviewUri)` for 50 to 500 MB: measured on macOS (§8). Windows and Linux are still open (PLT-31, board Q16). Why does a fast stream consumer peak at about the file size in the renderer when a slow one stays near 64 MiB (§8)?
- Can a web-target extension reach LAN printers (Moonraker over `ws://`) from `https://vscode.dev`? Mixed-content and Private Network Access rules suggest not without a relay.
- Default V8 heap limit of the extension host in Electron 43, and whether `--max-old-space-size` can be raised per host.
- Whether Microsoft will finalise any proposed API we would want (the shared-process or IPC proposals, `vscode.proposed.ipc.d.ts`). Without one, the daemon stays our own.
- Exact current Open VSX default `max-content-size` on open-vsx.org, which matters for bundling a slicer engine per target.
