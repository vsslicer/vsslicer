# Slicing engine architecture and embedding options

Card VSS-5. Researched 2026-10-25. The question: how a VS Code extension host (Node.js inside
Electron) could drive a slicing engine, as a library, a CLI, WASM or a local service.

Sources (shallow clones; read only, nothing built or run):

| Project | Commit | Version at that commit | Licence (verified at commit) |
| --- | --- | --- | --- |
| PrusaSlicer | `30ef591` (2026-09-21) | 3.0.0-alpha12 | AGPL-3.0 (`LICENSE`; [3.0 blog](https://blog.prusa3d.com/prusaslicer-3-0-preview-built-for-the-future-of-3d-printing_137672/)) |
| OrcaSlicer | `09aa0114` (2026-10-25) | 2.5.0-dev (`version.inc`) | AGPL-3.0 (`LICENSE.txt`) |
| BambuStudio | `79df7ae` (2026-10-13) | 02.08.04.57 (`version.inc:16`) | AGPL-3.0 |
| CuraEngine | `47b0388` (2026-10-15) | 5.15.0-alpha.0 (`conandata.yml:1`) | **AGPL-3.0-or-later** (`LICENSE:1`, `conanfile.py:18`) |
| Cura (frontend, for reference) | `5bea2f8` | 5.x | LGPL-3.0 |
| grid-apps (Kiri:Moto) | `d138275` (2026-07-26) | 4.7.0 (`package.json`) | MIT per `license.md`, but see Licence notes |

The raw notes are in `.reference/notes/VSS-5-slicing-engine-embedding.md`. The PrusaSlicer
clone is the 3.0 alpha master, which was restructured heavily. The findings about it apply to 3.0,
not to stable 2.9.x. The classic 2.x library API survives unchanged in Bambu Studio and Orca, and
it is documented from them.

## Findings

### 1. libslic3r as a library, and the PrusaSlicer and Orca CLIs

**Lineage.** libslic3r comes from Slic3r. PrusaSlicer forked it, Bambu Studio forked PrusaSlicer,
and Orca forked Bambu Studio. The Orca CLI (`--slice N`, `--load-settings`, `--pipe`,
`result.json`) started in Bambu Studio (`BambuStudio@79df7ae:src/BambuStudio.cpp:256-257,488`;
`src/libslic3r/PrintConfig.cpp:10010,10095,10247`). Orca inherited it. PrusaSlicer's CLI is a
separate design.

#### libslic3r library API

The classic API, as kept by Bambu Studio and Orca, `OrcaSlicer@09aa0114:src/libslic3r/PrintBase.hpp:470-516`:
- The pipeline is `Print::apply(Model, DynamicPrintConfig)`, then `Print::process()` on a worker
  thread, then `Print::export_gcode(path, GCodeProcessorResult*, thumbnail_cb)`. For the export step
  see `OrcaSlicer.cpp:7145`.
- Progress is `set_status_callback(std::function<void(const SlicingStatus&)>)`, where
  `SlicingStatus` holds `{percent, text, flags, warning_step, warning_level}`. With no callback set,
  progress goes to `BOOST_LOG debug` "Percent N: msg" (`PrintBase.cpp:123-129`).
- Cancellation is `cancel()`, `canceled()`, `restart()` and `CancelStatus`
  {NOT_CANCELED, CANCELED_BY_USER, CANCELED_INTERNAL} (`PrintBase.hpp:492-512`). Worker code polls
  `throw_if_canceled()` and unwinds with `CanceledException`.

PrusaSlicer 3.0 has a new interface:
- `IPrint::update(model, config, bed, metadata) -> ApplyStatus{InvalidData|Unchanged|Changed|Empty}`
  and `IPrint::slice(SlicingId, IThumbnailImageGenerator&, optional<SliceUntilStep>)`.
- Progress comes through `progress_callback(Progress{percent, ProgressInfo})`, and cancellation
  through `stop_token` (a `JThread::StopToken`).
- Sources: `PrusaSlicer@30ef591:src/libslic3r/include/libslic3r/IPrint.hpp:54-78`, and
  `SlicingStatus.hpp:14-44` for the stage enum and `:46+` for the typed `ErrorCode` validation enum.
- The GUI's `BackgroundProcess` runs `slice()` on a JThread. It cancels with `request_stop()` and maps
  exceptions to `StatusCode::InvalidData` (`src/slic3r-shared/src/Slic3r/Biz/Slicing/BackgroundProcess.cpp:207-286`).

The dependencies are heavy. Orca's libslic3r links Boost, oneTBB, CGAL (a separate `libslic3r_cgal`),
OpenVDB, OpenCASCADE (STEP), Draco, libjpeg, expat, libigl, mcut and admesh
(`OrcaSlicer@09aa0114:src/libslic3r/CMakeLists.txt:613-720`). No upstream project ships libslic3r
as a standalone shared library with a stable C ABI. It is a static C++ library linked into the app.

#### PrusaSlicer 3.0 CLI (`30ef591`)

| Item | Detail | Source |
| --- | --- | --- |
| Entry | The `slic3r-app-launcher` exe, using CLI11. With no action (or `--gcodeviewer`) it runs `Desktop::run` (GUI); otherwise it runs `App::CLI::run`. `src/PrusaSlicer.cpp` is stale and not built. | `src/slic3r-app-launcher/src/Slic3r/App/Launcher/main.cpp:79-152`; `src/CMakeLists.txt:12-47` |
| Headless-only build | Not possible. The CLI and launcher are built only with `SLIC3R_GUI`. The `else()` branch is `FATAL_ERROR "Non-GUI build is not supported yet."` | `src/CMakeLists.txt:30-47` |
| Inputs | Positional model or 3MF files. `--load FILE` takes JSON in the `--save` format, the same format as the config stored inside 3MF (2.x used INI, unverified). `--printer-profile`, `--print-profile`, `--material-profile a,b`, `--tool-print-profile` select presets by name from the datadir. Every config key is also a `--key-name` override. | `ReadCLI.cpp:125-165, 565-720` |
| Actions | `--export-gcode/-g`, `--slice/-s` (FFF or SLA, chosen by the printer profile), `--export-3mf/stl/obj/sla`, `--info`, `--save`, `--export-config-schema FILE` (a JSON model of every config key), `--query-printer-models` and `--query-print-tool-filament-profiles` (JSON) | `ReadCLI.cpp:400-560` |
| Misc | `--output/-o`, `--datadir`, `--loglevel`, `--threads N` | `ReadCLI.cpp:283-395` |
| Flow | A dummy dialog manager (most dialogs no-op; the ramming dialog and open-browser `PANIC`) feeds `load_print_data`, then `process_transform`, then `process_actions`. Forced preset updates must be approved within 30 s, or slicing is blocked. | `CLIApp.cpp:28-227`; `ProcessActions.cpp:855-901` |
| Progress | None printed. The CLI busy-waits on a status cache with a 1 ms poll. | `CLIRuntime.cpp:206-216`; `ProcessActions.cpp:311-322` |
| Errors | Slicing errors go to stderr, **but the exit code is still 0**: `process_actions` returns `true` when `perform_slicing_exports` fails. | `ProcessActions.cpp:784-787, 904-905` |
| GUI-only headless gaps | Thumbnails are not rendered. They are copied from a single input 3MF or left empty. Arrange runs. Network upload works through the job manager. | `CLIRuntime.cpp:38-106` |

#### Orca CLI (`09aa0114`, inherited from Bambu Studio)

| Item | Detail | Source |
| --- | --- | --- |
| Entry | The same binary as the GUI: `main` calls `CLI().run`. On Windows, `OrcaSlicer` is a DLL behind an exe stub. With no action it starts the GUI. On Linux with no `DISPLAY`/`WAYLAND_DISPLAY` it prints help and exits 1. | `src/OrcaSlicer.cpp:1149, 1424-1468, 8552-8562`; `src/CMakeLists.txt:142-146` |
| Inputs | Positional STL/3MF/STEP files. `--load-settings "machine.json;process.json"` and `--load-filaments "f1.json;f2.json"` take Bambu-style JSON presets. `--key=value` overrides most keys; 43 keys are refused ([wiki](https://www.orcaslicer.com/wiki/cli/cli_mode)). | `src/libslic3r/PrintConfig.cpp:13088-13097` |
| Actions | `--slice N` (0 = all plates, i = plate i), `--export-3mf f.3mf`, `--export-slicedata dir`/`--load-slicedata dir` (slice cache), `--export-settings f|-`, `--info`, `--inspect-mesh` (JSON on stdout), `--arrange`, `--orient`, `--uptodate`, `--mstpp` (time limit per plate), `--strict` | `PrintConfig.cpp:12727-12910` |
| Outputs | `<outputdir>/plate_<n>.gcode` and, if requested, a 3MF containing the G-code | `OrcaSlicer.cpp:7136-7145` |
| Progress | `--pipe <name>` writes one JSON line per update: `{plate_index, plate_count, plate_percent, total_percent, message|warning}`. **Linux only**: the whole callback manager is behind `#if defined(__linux__)`. | `OrcaSlicer.cpp:270-338, 1580-1590` |
| Errors | Typed negative exit codes: `CLI_INVALID_PARAMS -2`, `CLI_FILE_NOTFOUND -3`, `CLI_VALIDATE_ERROR -51`, `CLI_SLICING_TIME_EXCEEDS_LIMIT -58`, `CLI_SLICING_ERROR -100`, `CLI_GCODE_PATH_CONFLICTS -101`, and others. POSIX reports them modulo 256, so -100 arrives as 156. `result.json` (return code, error string, per-plate times, warnings) is written to `outputdir` **on Linux only**. | `src/libslic3r/Utils.hpp:43-95`; `OrcaSlicer.cpp:505-560` |
| GUI-only headless gaps | Plate thumbnails need an OpenGL 3.3 context from a hidden GLFW window. Without one the CLI logs "skipping thumbnail rendering" and continues, so a headless Linux machine needs Xvfb or EGL/Mesa for thumbnails. The CLI includes GUI headers, so it can only be built as part of the full GUI build (wxWidgets, GLFW, OCCT, embedded Python in the GUI). | `OrcaSlicer.cpp:136-142, 7455-7520`; `src/CMakeLists.txt:153-165` |

### 2. CuraEngine: CLI, Arcus, gRPC plugins, headless use

**CLI.** The synopsis is `CuraEngine slice [-v] [-m<threads>] [-p] [-d paths] [-j def.json] [-r resolved.json]
[-s key=value] [-g] [-e<n>] [-l model] [--next] [-o out.gcode]`
(`CuraEngine@47b0388:src/Application.cpp:116-151`).
- `-j` loads a `*.def.json` machine definition and resolves its `inherits` chain
  (`CommandLine.cpp:502-590`). The search path comes from `CURA_ENGINE_SEARCH_PATH` (`:47-50`).
- `-s` attaches a setting to whatever was named last (object, extruder or group).
- `-r` takes a fully resolved JSON of the form `{global, extruder.N, <model>.stl}` (`:337-380`).
- The engine does no preset or profile merging. The caller has to flatten Cura's
  definition, quality and material stack, which Uranium does in Cura.
- Models are STL (with an optional `.uv` sidecar) and OBJ only. There is no 3MF input
  (`src/MeshGroup.cpp:518-545`).
- G-code goes to the `-o` file or, by default, to stdout (`CommandLine.cpp:42-56, 287-301`). spdlog
  also writes to **stdout** (`stdout_color_sink_mt`, `src/Application.cpp:34-39`). Without `-o`,
  logs and G-code are interleaved on one stream, so the adapter must always pass `-o <file>`.
- Headless use works fully. The engine has no GUI dependencies.

**Arcus socket protocol.** `CuraEngine connect host[:port]` (default `127.0.0.1:49674`) makes the
engine the **client** of a TCP server that the frontend runs (`Application.cpp:63-110`;
`ArcusCommunication.cpp:293-320`).
- Framing, per [libArcus](https://github.com/Ultimaker/libArcus): three int32 values (header,
  size, type id) followed by protobuf bytes. Message types are registered on both sides.
- The engine registers `Slice`, `Layer`, `LayerOptimized`, `Progress`, `GCodeLayer`,
  `PrintTimeMaterialEstimates`, `SettingList`, `SlicingFinished` and `SettingExtruder`
  (`ArcusCommunication.cpp:298-306`).
- In `Cura.proto`:
  - `Slice` carries meshes as raw vertex, normal and index byte arrays with per-object settings,
    plus the `engine_plugins` list (`:34-63`).
  - `Progress{amount}` is 0..1 (`:65-68`; sent at `ArcusCommunication.cpp:465-480`).
  - `LayerOptimized`/`PathSegment` streams typed toolpaths for layer preview (`:104-125`).
  - `GCodeLayer{data}` streams G-code (`:129-131`).
- There is no JS binding. Node would need its own small framing layer plus `protobufjs` loading
  `Cura.proto`; the header magic value has not been checked.

**gRPC plugins (5.x).**
- Slots: `SIMPLIFY_MODIFY`, `INFILL_GENERATE`, `POSTPROCESS_MODIFY`, `SETTINGS_BROADCAST` and
  `GCODE_PATHS_MODIFY` (`include/plugins/slots.h:65-105, 231-235`).
- The engine is the gRPC client. It sends a handshake (`pluginproxy.h:93-115`) and sets a
  5-minute deadline per call (`:281-284`).
- localhost channels are insecure. Remote ones need SSL and the off-by-default
  `ENABLE_REMOTE_PLUGINS` (`src/utils/channel.cpp:14-36`; `CMakeLists.txt:14-15`).
- Plugin addresses arrive **only** in the Arcus `Slice` message (`ArcusCommunication.cpp:520-528`),
  so plain `slice` CLI runs cannot use plugins.
- Cura launches each plugin as a subprocess with `--address --port`
  (`Cura@5bea2f8:cura/BackendPlugin.py:58-96`).
- Plugins extend the engine. They are not an API for driving it. A VSSlicer-hosted plugin would
  need us to speak Arcus as well.

**Build.** CuraEngine builds with Conan 2 (>= 2.7) against UltiMaker's remote. The dependencies are
cura-formulae-engine, scripta, libpng, oneTBB, arcus 5.11.1 and curaengine_grpc_definitions 0.4.1
(`conanfile.py:13`; `conandata.yml`). The `_CuraEngine` static library is wrapped by a thin
`CuraEngine` exe (`CMakeLists.txt:319-330`).

### 3. WASM builds

| Engine | Status | Evidence | Feasibility, size, performance |
| --- | --- | --- | --- |
| **CuraEngine (upstream)** | An official Emscripten target exists in tree | `CMakeLists.txt:340-361`: `-sMODULARIZE -sEXPORT_ES6 -sSINGLE_FILE -sENVIRONMENT=web,worker,node -sALLOW_MEMORY_GROWTH -sEXPORTED_RUNTIME_METHODS=[callMain,FS] -lembind --emit-tsd CuraEngine.d.ts`. `EmscriptenCommunication.cpp:25-142` adds `--progress_cb`, `--slice_info_cb` and `--engine_info_cb`, which call `globalThis[name](json)`. | Usable from Node: callMain with CLI args, files in MEMFS. Single-threaded: oneTBB and threading are disabled for wasm (`conanfile.py:132-133,173`). The size of the single-file build was not measured (unverified; base64 inlining adds about 33%). No published npm artefact from UltiMaker was found. |
| CuraEngine (community) | `cura-wasm` / `@toybox-labs/cura-wasm` 1.5.4, CuraEngine 4.x era | [README](https://unpkg.com/@toybox-labs/cura-wasm@1.5.4/README.md) | Benchy: Node 15 took 7782 ms, Chrome 6615 ms and Firefox 6581 ms, against 2259 ms for native 4.6.1, so about 3x slower, partly because there is no OpenMP. Progress is reported 0-100. There is no cancel API. Earlier ports (gyf304/cura-emscripten, nelsonsilva/CuraEngine-em, Skeen/CuraJS-Engine) are unmaintained. All of these are superseded by the upstream target. |
| **libslic3r (PrusaSlicer 3.0)** | An in-tree Emscripten configuration exists, with no public artefact | `CMakeLists.txt:44-69, 250-266`: EMSCRIPTEN forces GUI on, OpenGL ES on, no STEP, `-sUSE_PTHREADS`. `src/CMakeLists.txt:40-44` drops the wx targets. Resources load from `/resources` (`slic3r-shared/src/Slic3r/App/Init.cpp:55`). | This targets the whole GUI app (SDL + GLES), not a headless library. It needs pthreads, so SharedArrayBuffer, which a browser only allows with cross-origin isolation; Node worker_threads provide it natively. No web announcement was found as of 2026-10-25 ([blog](https://blog.prusa3d.com/prusaslicer-3-0-preview-built-for-the-future-of-3d-printing_137672/), [releases](https://github.com/prusa3d/PrusaSlicer/releases)). Size and performance are unknown. |
| libslic3r (Orca/Bambu) | None | No EMSCRIPTEN references in Orca's CMake. The web search found no port. | Hard: OCCT, OpenVDB, CGAL, TBB and an embedded Python GUI. Not realistic for R1. |
| **Kiri:Moto** | Native JS, built for browsers | `grid-apps@d138275:src/kiri/run/engine.js:12-225` | The slicer is plain JS running in Web Workers. The WASM helpers are small: `kiri-geo.wasm` is 65 KB (Clipper), `kiri-sla.wasm` 1.5 KB, `kiri-ani.wasm` 312 B, plus `manifold.wasm` from npm `manifold-3d` (`src/wasm/`, `src/wasm/makefile`). Performance was not benchmarked. Feature depth is below Prusa, Orca and Cura (unverified; see VSS-1). |

The Kiri:Moto Engine API (`docs/kiri-moto/engine-apis.md`):
- `new Engine({workURL,poolURL})`, `parse(stlBuf)` and `setDevice`, `setProcess`, `setMode`.
- The pipeline is `slice()`, then `prepare()`, then `export()`, which resolves to `Promise<string>`
  of G-code.
- `setListener` delivers `{slice}`, `{prepare:{update}}` and `{export:{segment}}`.
- Input is STL only (`engine.js:36-75`).
- `src/kiri/run/cli.js` is a Node example. It fakes `self`, `fetch` and `Worker` and evals a source
  list. That loader predates the ESM engine and is likely stale (unverified, not run).

### 4. Options for an extension host

| Option | How it works | Packaging (macOS/Windows/Linux, signing) | Fit |
| --- | --- | --- | --- |
| **A. Spawn a native CLI** (Orca/Bambu/Prusa/CuraEngine) | `child_process.spawn` with an argv array (no shell). Inputs and outputs are temp files. Results come from stdout, stderr, the exit code, the output files and Orca's `result.json`/`--pipe` (Linux). | Use the user's installed slicer, or download the official release into `globalStorageUri`. Bundling Orca or Prusa means one platform-specific VSIX per target, from `win32-x64/arm64`, `linux-x64/arm64/armhf`, `alpine-*`, `darwin-x64/arm64` (VS Code >= 1.61, vsce >= 1.99; [docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)), and Open VSX `ovsx publish --target` ([openvsx#461](https://github.com/eclipse/openvsx/issues/461)). A bundled macOS binary must be signed and notarised by us, and Windows binaries signed to avoid SmartScreen (unverified for VSIX-extracted files). The binaries are large, a full GUI build including wx and OCCT. | Best fidelity. Profiles are the real ones. The process boundary contains crashes. |
| **B. Native Node module** (N-API wrapping libslic3r or `_CuraEngine`) | In-process C++ addon | Needs prebuilt `.node` files per platform and arch in platform VSIXs. N-API avoids the Electron ABI rebuild; the older C++ addon API does not ([Electron docs](https://electron.atom.io/ru/docs/latest/tutorial/using-native-node-modules)). Must be signed and notarised on macOS. We would build the whole dependency tree (Boost, TBB, CGAL, OCCT) ourselves. | Poor. A segfault or OOM in slicing kills the extension host and every other extension in it. Linking makes our addon a derivative work under AGPL. Very high build cost. |
| **C. WASM in a worker** (CuraEngine upstream target, Kiri:Moto) | Load the ES6 module in a `worker_threads` Worker. Write the STL and def.json into `FS` and call `callMain(['slice', ...])`. Progress comes through `--progress_cb` and a global function. | One universal VSIX; the WASM also works on the `web` target and vscode.dev. No native signing. Size is a few MB (unverified). Bundling the AGPL WASM makes the VSIX that carries it AGPL, so it must live in a separate engine extension (see Recommendation 4). | Good portability and isolation. Single-threaded CuraEngine is about 3x slower than native (cura-wasm benchmark). No Prusa/Orca equivalent exists. |
| **D. Local service** (HTTP/gRPC sidecar, or Arcus server) | A long-lived process: either our own sidecar wrapping a CLI, or the extension acting as an Arcus server that CuraEngine connects to (as Cura does). | Same binaries as A. The Arcus route needs only the CuraEngine binary, which has no GUI dependencies, plus protobufjs. | Arcus gives streamed progress, per-layer toolpaths for preview, G-code and estimates. No upstream HTTP/gRPC slicing API exists for any of the engines. SimplyPrint runs the Prusa, Orca, Bambu and Cura CLIs server-side ([SimplyPrint](https://simplyprint.io/features/slicer/prusaslicer)), so a service means wrapping a CLI. |

### 5. Progress, cancellation and error handling per option

| Option / engine | Progress | Cancellation | Errors |
| --- | --- | --- | --- |
| A. Orca/Bambu CLI | Linux: `--pipe` JSON lines (create a FIFO and read it). macOS/Windows: no structured channel, so use stage text from `--debug 3+` log lines (format unverified) or show indeterminate progress. | Kill the process (SIGTERM, or `taskkill /T` on Windows). Output files are partial, so write into a temp dir and move into place on success. | The exit code maps to the `Utils.hpp:43-95` table (read it as a signed byte). `result.json` on Linux. Otherwise stderr. |
| A. PrusaSlicer 3.0 CLI | None (busy-wait, nothing printed) | Kill the process | **The exit code is unreliable (0 on slicing failure).** Check that the output file exists and parse stderr. |
| A. CuraEngine CLI | Only the spdlog stage lines "Starting <stage>..." on **stdout** (`src/progress/Progress.cpp:46-62`; sink at `src/Application.cpp:34-39`). Always pass `-o` so G-code does not mix with them. `CommandLine::sendProgress` emits nothing, and `-p` is a FIXME no-op (`CommandLine.cpp:96-103, 204-206`). | Kill the process | Exit 1 with an spdlog error on bad arguments or model load, "Unknown exception" from the slice catch-all, or SIGFPE (`CommandLine.cpp:483-499`; `main.cpp:39-58`) |
| B. Native module | `set_status_callback` (classic) or `progress_callback` (Prusa 3), marshalled through a thread-safe N-API function | `PrintBase::cancel()` or `stop_token.request_stop()`, which is cooperative through `throw_if_canceled` | C++ exceptions such as `SlicingError` and validation `ErrorCode`, converted to JS errors. A crash takes down the host. |
| C. WASM CuraEngine | `--progress_cb` gives 0..1 values. `--slice_info_cb` gives time per feature and filament per extruder. | `worker.terminate()`. The engine has no cooperative cancel, and a single-threaded `callMain` blocks its worker. | Non-zero exit or `abort` from `callMain`. Memory-growth OOM throws in the worker. |
| C. Kiri:Moto | `setListener` events | `client.restart()`: `worker.terminate()`, and pending calls get `{error:"cancelled operation"}` (`src/kiri/app/workers.js:123-172`) | A `{error}` message in the slice callback (`engine.js:179-205`) |
| D. Arcus (CuraEngine) | `Progress.amount` 0..1, plus `LayerOptimized` streaming | Kill the engine process and re-listen, which is what Cura does (`Cura@5bea2f8:plugins/CuraEngineBackend/CuraEngineBackend.py:326-330, 433-460`). The protocol has no cancel message. | Socket error or close, and the process exit code |

### 6. Recommended strategy

1. **Hide engines behind one `SlicerEngine` interface in the extension**:
   `slice(job): AsyncIterable<Progress|Warning|Layer>` resolving to G-code/3MF paths, plus `cancel()`.
   Run every engine **out of process** (child process or Worker), never in the extension host thread.
2. **Primary engine for R2: spawn the Orca (Bambu-lineage) CLI.**
   - It matches the 3MF-centred product. VSS-1, VSS-12 and the profile cards decide on Orca-format
     profiles.
   - It has typed exit codes, plate selection, and JSON presets we can generate.
   - Detect a user-installed Orca, or offer to download the official release. **Do not bundle it in
     the VSIX.** That avoids per-platform VSIXs of hundreds of MB and notarising someone else's
     binary, and it keeps AGPL distribution duties with upstream.
   - Show progress with `--pipe` on Linux and indeterminate progress elsewhere. Upstream a
     cross-platform `--pipe` (named pipe on Windows, FIFO on macOS) as a small Orca PR.
3. **PrusaSlicer CLI: an adapter, but not a default** until 3.0 is stable. Account for the exit-0
   bug and the absence of progress output.
4. **CuraEngine: second adapter, through Arcus over localhost TCP.** The extension acts as the
   server; the protocol can be reimplemented in about 200 lines of Node plus protobufjs (estimate).
   - It gives the best progress and live layer data of any option.
   - The binary is headless-clean.
   - The CuraEngine WASM target is the **zero-install fallback**. It works on vscode.dev and has an
     exact progress callback, at about 3x native time. **Licence consequence:** the WASM is
     CuraEngine, which is AGPL-3.0-or-later (`LICENSE:1`).
     - Bundling it inside the main VSSlicer VSIX and calling it through its JS API (`callMain`, `FS`,
       callbacks) very likely makes that VSIX a combined work under AGPL, so the whole extension
       would have to be AGPL (unverified legal reading; for VSS-16).
     - To keep our own licence, ship it as a **separate, AGPL-licensed engine extension**. That
       extension would contain the unmodified WASM, its source offer and a thin worker shim. The
       main extension would talk to it only through a message or command boundary, for example
       `vscode.commands` or a worker `postMessage` protocol with files in and G-code out, in the same
       arm's-length way as spawning a CLI.
     - Otherwise, accept AGPL for VSSlicer as a whole.
5. **Kiri:Moto**: candidate for a `web`-target or "no slicer installed" mode, but only once the
   licence-header question is resolved (see Licence notes).
6. **Reject the native Node module.** It brings crash isolation loss, an AGPL linking consequence,
   and an unbuildable dependency tree for four OSs.

## Comparison

| | Orca/Bambu CLI | PrusaSlicer 3.0 CLI | CuraEngine CLI | CuraEngine Arcus | CuraEngine WASM | Kiri:Moto JS |
| --- | --- | --- | --- | --- | --- | --- |
| Headless-only build | No (GUI build) | No (`FATAL_ERROR`) | Yes | Yes | Yes | Yes (JS) |
| Model input | STL/3MF/STEP/OBJ | STL/3MF/OBJ/STEP | STL/OBJ | Raw mesh bytes | STL/OBJ in MEMFS | STL |
| Config input | JSON presets + `--key` | JSON + preset names + `--key` | def.json + `-s`/`-r` (caller resolves) | SettingList | Same as CLI | JSON device/process |
| Progress | Linux `--pipe` only | None | Logs only | 0..1 + layers | 0..1 callback | Listener events |
| Cancel | Kill | Kill | Kill | Kill + re-listen | `worker.terminate` | `worker.terminate` |
| Error signal | Typed exit codes | stderr (exit 0) | Exit 1 + log | Socket/exit | Exit/abort | `{error}` |
| Threads | TBB | TBB | TBB | TBB | 1 | Web Worker pool |
| Licence | AGPL-3.0 | AGPL-3.0 | AGPL-3.0+ | AGPL-3.0+ engine; libArcus LGPL-3.0 | AGPL-3.0+ | MIT (headers say otherwise) |

## Implications for VSSlicer

- **Reuse by wrapping**, out of process: the Orca CLI first, then CuraEngine through Arcus, with
  CuraEngine WASM as a fallback. The WASM goes in its own AGPL engine extension, never inside the
  main VSIX (see Recommendation 4 and Licence notes).
- **Reimplement** the Arcus framing in TS (small and well specified). Write the Orca preset JSON
  emitter, and resolve Cura settings ourselves if Cura is supported, because the engine does not
  resolve its own stack.
- **Skip** native addons and our own libslic3r builds for R1/R2. Revisit the PrusaSlicer 3.0
  Emscripten target once Prusa publishes it.
- **Thumbnails**: neither CLI renders them reliably headless (Prusa copies them from a 3MF; Orca
  needs GL). We already have a 3D viewer in a webview, so render the thumbnails there and inject them
  into the 3MF/G-code ourselves.
- **Previews**: for Orca/Prusa, the G-code preview parses G-code (VSS G-code cards). The Cura Arcus
  path can feed `LayerOptimized` directly.
- **Packaging**: if we only download upstream releases, the main VSIX stays universal, pure TS and
  free of AGPL code.
  - The optional CuraEngine WASM engine extension is also universal, but it is AGPL and must carry
    the corresponding source offer.
  - Add platform-specific VSIX targets only if we later bundle CuraEngine native binaries. These go
    in a separate AGPL engine extension as well.

## Licence notes

- **Card correction: CuraEngine is AGPL-3.0-or-later, not LGPL** (`CuraEngine@47b0388:LICENSE:1`,
  `conanfile.py:2,18`, `src/main.cpp:2`). The LGPL-3.0 parts are the Cura frontend, Uranium and
  libArcus. libArcus's repository is inconsistent: the sidebar says LGPL-3.0 and the README says
  AGPLv3 ([libArcus](https://github.com/Ultimaker/libArcus)). Verify its LICENSE file before
  vendoring.
- **PrusaSlicer, Bambu Studio and Orca are AGPL-3.0.** PrusaSlicer 3.x confirmed this
  ([blog](https://blog.prusa3d.com/prusaslicer-3-0-preview-built-for-the-future-of-3d-printing_137672/)).
- **Linking** (option B, or loading AGPL WASM into our own module) very likely makes the combined
  work subject to AGPL. That is a legal judgement and is unverified; VSS-16 should confirm.
- **Spawning an unmodified, separately installed binary over a CLI or socket** is the usual
  "aggregate" reading, which would let our extension keep its own licence (unverified legal opinion;
  for VSS-16).
- **Shipping AGPL binaries ourselves**, whether inside a VSIX or as a download we host, requires us
  to offer the corresponding source.
- **Kiri:Moto**: `license.md` and `package.json` say MIT, but 254 source files carry
  "Copyright Stewart Allen -- All Rights Reserved" headers (e.g. `src/kiri/run/engine.js:1`). Get a
  written confirmation from the author, or treat Kiri:Moto as not reusable.
- cura-wasm: the engine is AGPL3+, the wrapper LGPL3+ and MIT
  ([README](https://unpkg.com/@toybox-labs/cura-wasm@1.5.4/README.md)).

## Open questions

- The exact Arcus header magic and version handling: read `libArcus` `Socket_p.h` before
  implementation.
- The size and real speed of the upstream CuraEngine Emscripten single-file build. This needs a
  build in a sandbox, which this card did not allow.
- Whether Orca's `--debug` log lines on macOS and Windows carry stable progress text that is safe to
  parse.
- Does VS Code set the macOS quarantine attribute on executables extracted from a VSIX, or on files
  downloaded into `globalStorage`? This decides whether notarisation is needed for bundled or
  downloaded engines.
- Does UltiMaker publish the WASM build anywhere, for example for the Digital Factory web slicer?
- When does PrusaSlicer allow a non-GUI build, and will the 3.0 Emscripten target be published?
