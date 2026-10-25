# Projects and fleet tools

Researched 2026-10-25 (card VSS-14). Code read: OrcaSlicer@09aa0114, PrusaSlicer@30ef591 (version 3.0.0-alpha12, a restructured tree, not 2.x), Cura@5bea2f8. Web sources are cited inline. Raw notes: `.reference/notes/VSS-14-projects-and-fleet.md`. Paths are relative to each repo root.

## Findings

### 1. Project models

**PrusaSlicer 2.x / Slic3r lineage (background).** One `Model` holds objects. An object holds volumes (parts, modifiers, supports) and instances: `ModelObject` has `ModelVolumePtrs volumes` and `ModelInstancePtrs instances`, and `Model` owns the objects (PrusaSlicer-2.9@b028299:src/libslic3r/Model.hpp:375,382,385,746,1139,1255). There is no plate or bed index anywhere in these classes: one bed, one plate. The 2.x undo stack is `src/slic3r/Utils/UndoRedo.hpp` in the same tree. Orca and Bambu Studio inherit this model, and Orca still uses the 2.x undo code.

**PrusaSlicer 3.0 alpha12 is no longer single-plate.**
- `Domain::Project` is documented as "all data that can be loaded/saved into .3mf". It owns a `Model`, a list of `ConfigContainer`s, a `BedContainer` with several `Bed`s, and metadata with a version counter (PrusaSlicer@30ef591:src/slic3r-domain/include/Slic3r/Domain/Project.hpp).
- `BedInstance` is a bed in the project. It lists its `model_instances` and carries its own `wipe_tower`, `custom_gcode` and `extruder_candidates` (src/slic3r-domain/include/Slic3r/Domain/BedInstance.hpp:36-60). Per-bed config is found with `find_config_container_by_bed_instance_id` (Project.hpp).
- Several projects can be open at once. `BackupStore` is keyed by `SelectionId project_id` (src/slic3r-shared/include/Slic3r/Biz/BackupStore.hpp:17-60).
- Model membership is instance-centric: the bed lists instances, and the instance does not point at a bed.

**Bambu Studio / OrcaSlicer: plates.**
- `PartPlate` (src/slic3r/GUI/PartPlate.hpp:107) holds `obj_to_instance_set` (:123), `m_plate_index` (:125), `m_locked` (:133), `m_ready_for_slice` and `m_slice_result_valid` (:134-135), the plate's `GCodeProcessorResult` (:140), and its own `DynamicPrintConfig m_config` (:211).
- `ModelObject`, `ModelVolume` and `ModelInstance` (src/libslic3r/Model.hpp:381, 831, 1420) have no plate field. Plate membership exists only in `PartPlate` (`PartPlateList::add_to_plate`, PartPlate.cpp:7421). A plate is the unit that gets sliced, thumbnailed, G-coded and sent to a printer.
- Project 3MF is a zip. `Metadata/model_settings.config` holds `<plate>` elements with keys such as `locked` and `plater_id`; `plate_<n>.png` are per-plate thumbnails; `slice_info.config` holds slice results; `project_settings.config` holds the config; `Auxiliaries/` is free-form (src/libslic3r/Format/bbs_3mf.cpp:222-250, 401, 6584, 8441-8510).
- Orca/Bambu is the only mainstream model where "plate" is a first-class persisted object.

**Cura: scene plus build-plate tag.**
- The scene is a graph of `CuraSceneNode`s. A "build plate" is only a tag: `BuildPlateDecorator(build_plate_number)` (cura/Scene/BuildPlateDecorator.py:5-10). `CuraSceneController` derives the plate count and names them "Build Plate N" (cura/Scene/CuraSceneController.py:67-75).
- Slicing and print information are keyed by plate number (cura/UI/PrintInformation.py:108-117).
- Per-model settings are a `SettingOverrideDecorator` on the node (cura/Scene/CuraSceneNode.py:16,27).
- The project file is a "workspace" 3MF. `ThreeMFWorkspaceWriter` adds `Cura/preferences.cfg`, `Cura/version.ini` and serialised machine, extruder, definition-changes and quality-changes containers (plugins/3MFWriter/ThreeMFWorkspaceWriter.py:30,104-197,222). `ThreeMFWriter` adds `Cura/packages.json` listing material and plugin packages (plugins/3MFWriter/ThreeMFWriter.py:59,312). Opening a workspace asks how to merge or replace profiles (plugins/3MFReader/WorkspaceDialog.py).

**Undo/redo and autosave**

| | Undo | Autosave / crash recovery |
|---|---|---|
| PrusaSlicer 2.x / Orca | Snapshot stack of serialised model state (OrcaSlicer@09aa0114:src/slic3r/Utils/UndoRedo.hpp:32-100). Orca's `PartPlate` is cereal-serialised for it (PartPlate.hpp:737-764). Memory cap about 10% of RAM, oldest snapshots dropped (UndoRedo.cpp:561). | Orca (inherited from Bambu): background thread `_BBS_Backup_Manager` writes a full 3MF to `<backup dir>/.3mf` when dirty, with per-object incremental tasks (src/libslic3r/Format/bbs_3mf.cpp:9205-9400; MainFrame.cpp:773-790). Interval is `backup_interval`, default 10, minutes (unverified) (AppConfig.cpp:648). Crash restore reads `lock.txt` (pid), `origin.txt` and the 3MF (bbs_3mf.cpp:9794; Plater.cpp:8333-8341). The backup is deleted on save or close (Plater.cpp:16335). |
| PrusaSlicer 3.0 alpha | Snapshot stack of serialised model, bed selection and config containers (src/slic3r-shared/src/Slic3r/App/Undo/ModelSerialize.cpp, BedSelectionStateSerialize.cpp, ConfigContainerListSerialize.cpp). Cap min(RAM/10, 1 GiB) (Stack.cpp:419). | `BackupStore` writes each unsaved project to a `.3mf`, is event-driven (`invalidate_backup`), is per project, and detects crashes via per-process uuid with a 5 s grace period (BackupStore.cpp:156-166, 272, 320). |
| Cura | Uranium `UM.Operations` command objects (`GroupedOperation`, `SetTransformOperation`; cura/CuraApplication.py:32-34). Stack internals are in Uranium, which was not cloned (unverified). | `AutoSave` saves only preferences, instances and profiles, debounced 10 s (cura/AutoSave.py:22,59-64). The scene is never autosaved. `cura/Backups/BackupsManager.py` backs up configuration, not projects. |

### 2. Print queue and farm tools

All facts were checked on 2026-10-25 against the cited pages. "Self-hostable" means the server runs on your own machine.

| Tool | Licence | Hosted / self-hosted | Printers | Queue | API | Source |
|---|---|---|---|---|---|---|
| Obico | AGPL-3.0 (obico-server@6f93896:LICENSE) | Self-host via Docker Compose (port 3334, SMTP needed), plus a hosted service | OctoPrint, Klipper (via plugins) | No print queue. The server models `Print`, `Printer` and `GCodeFile`/`GCodeFolder` (stored files), with no queue resource; `queue` in the backend only refers to background tasks | Yes, a REST API at `/api/v1/` with viewsets for `users`, `printers`, `prints`, `g_code_files`, `g_code_folders`, `printer_events`, `tunnels` and more, using session or OAuth2 auth (obico-server@6f93896:backend/api/urls.py:9-56, viewsets.py:287-297). No separate API docs in `docs/` (model training and Docker only) | https://github.com/TheSpaghettiDetective/obico-server |
| SimplyPrint | Proprietary SaaS | Hosted only (api.simplyprint.io) | OctoPrint-compatible plugin, Klipper, own clients | Yes. `POST /queue/AddItem` takes `for_printers` and `position:"top"`. Accepts gcode, 3MF and STL | REST, 100+ endpoints, `X-API-KEY` or OAuth2, from the Pro plan, 60/180/600 req/min, webhooks on Print Farm and above, job history readable | https://simplyprint.io/features/api , https://help.simplyprint.io/en/article/adding-items-to-the-print-queue-files-plates-custom-fields-and-the-api-5aht3p/ |
| OctoFarm | AGPL-3.0 | Self-host, MongoDB | OctoPrint only | Not stated; has history and logs | Uses OctoPrint's API; no documented own API. V2 rewrite is in a private repo | https://github.com/OctoFarm/OctoFarm |
| FDM Monster | AGPL-3.0 | Self-host (Docker, script, MonsterPi, Unraid), SQLite | OctoPrint, Moonraker, PrusaLink, Bambu LAN | Batch print one file to many printers. "Print Queue" is on its roadmap list. Reads .gcode, .bgcode, .gcode.3mf | API test coverage listed as a development item; OpenAPI not confirmed | https://github.com/fdm-monster/fdm-monster |
| Mainsail | GPL-3.0 | Self-host (UI for Klipper/Moonraker) | Klipper | Job queue store calls `server.job_queue.status/post_job/delete_job/start/pause` over the Moonraker websocket (mainsail@03a4d7b:src/store/server/jobQueue/actions.ts:12-101); history through the same socket (src/store/socket/actions.ts) | Moonraker API (below) | https://github.com/mainsail-crew/mainsail |
| Fluidd | GPL-3.0 | Self-host (UI for Klipper/Moonraker) | Klipper; manages several printers from one install | Types the Moonraker job queue (fluidd@b36a497:src/typings/moonraker.job_queue.d.ts:2-41) and calls `server.history.get_job/list/totals/delete_job/reset_totals` (src/api/socketActions.ts:591-633) | Moonraker API | https://github.com/fluidd-core/fluidd |
| Bambu Farm Manager | Proprietary, free | Local server plus client on the LAN | Bambu only: P1P/P1S/A1/A1 mini/X1C first, X1E and H2D planned in 2025 (not confirmed shipped) | Queue and dispatch to free printers; "Direct to Print" lists only printers with matching nozzle; groups and batch commands. Accepts single-plate gcode.3mf only (per wiki) | No public API found | https://wiki.bambulab.com/en/software/bambu-farm-manager , https://blog.bambulab.com/bambu-lab-introduces-local-fleet-control-with-bambu-farm-manager/ , https://all3dp.com/4/bambu-labs-new-free-print-farm-software-streamlines-multi-printer-management/ |
| 3DPrinterOS | Proprietary | Cloud; "Private Cloud Deployment" listed | Multi-brand (Bambu, Klipper, Prusa, Dremel, Ultimaker, Creality K1 named) | "Print Queues" feature, RBAC and file sharing (third-party listing) | "APIs" listed; docs not found (unverified) | https://www.3dprinteros.com/ , https://us.fitgap.com/products/004539/3dprinteros (third-party; price from about $19/month, unverified) |
| Repetier-Server | Proprietary, free tier plus paid licence (tiers unverified; Capterra lists €59.99 one-time, third-party) | Self-host on Windows, macOS, Linux, Raspberry Pi | Multiple printers at once | Sent prints join a server queue; an empty queue starts immediately; "Save to Server" stores without printing | Per-user API keys with that user's rights, plus a global key; endpoints not documented on the page fetched | https://www.repetier-server.com/?p=330 |

**Moonraker job queue** (https://moonraker.readthedocs.io/en/latest/external_api/job_queue/)
- Endpoints: `GET /server/job_queue/status`, `POST` and `DELETE /server/job_queue/job`, `POST /server/job_queue/pause`, `/start`, `/jump`. JSON-RPC names are `server.job_queue.*`.
- A queued job has only `filename`, `job_id`, `time_added` and `time_in_queue`.
- Queue states: `ready`, `loading`, `starting`, `paused`.
- It queues filenames on one printer. It has no per-job printer targeting or requirements.

**Queue models seen**

| Model | Seen in | Item carries |
|---|---|---|
| Per-printer FIFO of files | Moonraker, Repetier | file name |
| Fleet pool with targeting | SimplyPrint, Bambu Farm Manager | file, optional target printers or groups, compatibility check (nozzle, material, model) |
| Batch fan-out | FDM Monster | one file to N printers |

### 3. Job history: what is recorded and retrievable

- **Moonraker** (https://moonraker.readthedocs.io/en/latest/external_api/history/): `GET /server/history/list` (`limit` 50, `start`, `since`, `before`, `order`), `/totals`, `POST /reset_totals`, `GET` and `DELETE /server/history/job?uid=`.
  - A job has `job_id`, `user`, `filename`, `exists`, `status`, `start_time`, `end_time`, `print_duration`, `total_duration`, `filament_used` (mm), `metadata` (G-code metadata snapshot) and `auxiliary_data` (`provider`, `name`, `description`, `value`, `units`).
  - `status` is one of `in_progress`, `completed`, `cancelled`, `error`, `klippy_shutdown`, `klippy_disconnect`, `interrupted`.
  - Totals are `total_jobs`, `total_time`, `total_print_time`, `total_filament_used`, `longest_job` and `longest_print`.
  - The record includes no thumbnail binary, no slicer settings and no failure photos, but it can hold the G-code metadata, which usually has the thumbnail and slicer values.
- **OctoPrint core** (https://docs.octoprint.org/en/master/api/job.html): `GET /api/job` returns only the current job (`job`, `progress`, `state`, optional `error`). Core has no history API. History comes from plugins; the main one, PrintJobHistory, is listed as abandoned (https://plugins.octoprint.org/plugins/PrintJobHistory). It stores filename, start/end, status, user, slicer settings, thumbnail, layer info and filament usage in a database and exports CSV.
- **Bambu cloud** (undocumented, reverse engineered; checked 2026-10-25 at https://github.com/Doridian/OpenBambuAPI/blob/main/cloud-http.md, which is GFDL-1.3): `GET /v1/user-service/my/tasks` with optional `deviceId`, `after`, `limit`, returning `total` and `hits`. A task has `id`, `designId`, `modelId`, `title`, `cover`, `status` (2 finished, 3 aborted or failed), `startTime`, `endTime`, `weight`, `costTime`, `plateIndex`, `profileId`, `deviceId`, `amsDetailMapping` (per filament: type, weight, AMS slot, colour) and `mode`. Newer responses add `length`, `plateName`, `deviceModel` and `nozzleInfos`. `weight`, `costTime` and `length` are slice estimates; real duration is `endTime - startTime`. Orca's closed network plugin exposes the same: `get_user_tasks(TaskQueryParams{dev_id,status,offset,limit=20})`, `get_subtask_info`, `get_task_plate_index`, `get_slice_info(project_id, profile_id, plate_index)` (OrcaSlicer@09aa0114:src/slic3r/Utils/NetworkAgent.hpp:113-118). Retrievable only with a Bambu account and the plugin or token, not over LAN. The cloud API may change with firmware or authorisation updates (date: 2026-10-25, not tested).
- **SimplyPrint**: job history is readable through its API (https://simplyprint.io/features/api); field list not captured (unverified).
- **Slicer side:** none of PrusaSlicer, Orca or Cura keeps a history of sent jobs. Cura's `PrintInformation` is transient. Orca sends `plate_index`, `project_name` and `task_name` with each print (src/slic3r/Utils/bambu_networking.hpp:193-246), which is what the Bambu cloud later reports.
- **Joining slicer and printer records:** the Bambu `designId`, `profileId` and `plateIndex` and Moonraker's `metadata` snapshot are the only built-in links back to the project. A slicer-owned history needs its own job id written into the sent file's metadata.

### 4. Mapping to a VS Code workspace

What VS Code gives (https://code.visualstudio.com/docs/editing/workspaces/multi-root-workspaces , https://code.visualstudio.com/api/references/vscode-api):
- `.code-workspace` JSON with a `folders` array (optional `name` per folder), plus `settings`, `extensions` recommendations, `launch` and `tasks`.
- Only resource-scoped settings apply per folder. Workspace settings override user settings, and folder settings override workspace settings. Each root can hold its own `.vscode/`.
- Extension API: `workspace.workspaceFolders`, `onDidChangeWorkspaceFolders`, `updateWorkspaceFolders`, `workspaceFile`, `createFileSystemWatcher`, `registerFileSystemProvider`, `registerCustomEditorProvider` (names confirmed in the API reference). A custom editor gets VS Code's own undo/redo, dirty state and hot-exit backups through `CustomDocumentBackup` (confirmed to exist in the reference; the behaviour is from memory, unverified).
- Limits: extensions that are not multi-root aware run only in the first folder. Tasks in a workspace file must be `shell` or `process` type. Untitled workspaces last only while the window is open.

Mapping:

| Slicer concept | VS Code concept | Fit |
|---|---|---|
| Project | A workspace folder (one root = one project) | Good. One window can hold several projects, matching PrusaSlicer 3.0's multi-project, and the folder gives git, diff and sync for free |
| Project file | One `.3mf` in the folder, opened by a custom editor | Good. Orca-compatible 3MF keeps plates inside the file |
| Models | STL/3MF/OBJ files in the folder, referenced by the project 3MF | Good. Files are visible in Explorer; the 3MF can reference them or embed copies |
| Plate | A virtual child node under the 3MF in a TreeView | Plates are not files, so Explorer cannot show them. Making each plate its own file would split state that Orca keeps together (locked flag, wipe tower, per-plate config) |
| Profiles | JSON files in the folder or `.vscode`-style settings | Folder-scoped settings give per-project override for free |
| Queue | A TreeView in the sidebar, stored in a file | Not a file concept, so it needs its own view |
| History | Append-only file plus a TreeView | See recommendation |

A multi-root workspace gives: several projects in one window, a place for a fleet root next to them, per-folder settings, shared tasks, and a single `.code-workspace` file to save the session. It does not give per-folder UI state (the editor layout is workspace-wide), and some extension APIs fall back to the first root.

### 5. Recommendation

**Project layout**
- One folder = one project. The source of truth is `<name>.3mf` in the Orca/Bambu 3MF shape (plates in `model_settings.config`, `project_settings.config`, per-plate thumbnails). Reusing that shape keeps Orca and Bambu Studio interoperability.
- Extra state goes in `<project>/.vsslicer/`: `queue.json`, `history/*.jsonl`, `sliced/<plate>.gcode`. Keep it out of the 3MF so it can be git-ignored or shared on its own.
- Plates show as TreeView nodes under the 3MF, each with its sliced G-code state, estimate and a "send" action.
- Offer the `.code-workspace` file as the way to group projects with the fleet root.

**Undo/redo and autosave**
- Open the project in a custom editor (`registerCustomEditorProvider`) so VS Code supplies undo, dirty marker and hot-exit backup.
- Inside the editor use Cura's approach (command objects with grouping) rather than whole-model snapshots, because a model made of large meshes makes snapshots expensive. PrusaSlicer and Orca cap their stacks at 10% of RAM for that reason. This is a design choice, not a measured result.
- Use VS Code's backup store, not a bespoke backup thread. Orca's lock file, `origin.txt` and pid check are all things VS Code's hot exit already handles.

**Queue model**
- Fleet-level queue, not per printer. An item is `{id, plate_ref, gcode_path, target: printer | group | any, requires: {nozzle, material, model}, state, added_at}`. States borrowed from Moonraker: `ready`, `starting`, `paused`, plus `done` and `failed`.
- Drive Moonraker printers through their native queue (`POST /server/job_queue/job`). For others, run the dispatch in the extension.
- The compatibility check before dispatch is the thing Bambu Farm Manager (nozzle match) and SimplyPrint (`for_printers`) both do; copy it.
- Write the queue to `queue.json` in the project, or to the fleet root when it spans projects.

**History storage**
- Our own append-only JSONL per project (`.vsslicer/history/YYYY-MM.jsonl`). The record is Moonraker's job object (`job_id, filename, status, start_time, end_time, print_duration, total_duration, filament_used, metadata, auxiliary_data`) plus `project`, `plate_index`, `printer_id`, `profile_ref` and `thumbnail`, so we hold the slicer-to-printer link that no printer-side store has.
- Fill it from our own sends first. Back-fill from Moonraker `history/list` and the Bambu cloud `my/tasks` (see section 3 for the cloud caveats) as optional importers, deduplicated by printer plus `start_time`.
- Write a VSSlicer job id into the sent file's metadata so a printer-side record can be matched back later.

## Comparison

| | PrusaSlicer 2.x | PrusaSlicer 3.0 alpha | Orca / Bambu | Cura |
|---|---|---|---|---|
| Projects open at once | 1 | many | 1 | 1 |
| Plates | none | `BedInstance`s (instance-centric) | `PartPlate`s (plate holds object/instance set) | tag on scene nodes |
| Per-plate config | no | yes (`ConfigContainer` per bed instance) | yes (`PartPlate::m_config`) | no (global stack, per-model overrides) |
| Project file | 3MF + config | 3MF (`Project`) | 3MF with plate metadata and `slice_info` | workspace 3MF with profile containers |
| Undo | snapshot stack | snapshot stack | snapshot stack | operation stack |
| Autosave | backup (see notes) | per-project 3MF backup, event driven | 3MF backup thread, minutes | settings only |
| Job history | none | none | cloud tasks via plugin | none |

## Implications for VSSlicer

| Item | Decision | Reason |
|---|---|---|
| Plate model | Reimplement from the 3MF spec, shaped like Orca's `PartPlate` metadata | The plate is the unit of slicing and sending. Do not copy `PartPlate` (AGPL, GUI-bound) |
| Project = folder | New | Native to VS Code, and PrusaSlicer 3.0's multi-project direction confirms the need |
| Undo/backup | Use VS Code custom editor facilities | Avoids writing a backup thread and crash recovery |
| Queue | New, small, Moonraker-shaped | Moonraker's states are simple and proven; the fleet pool with compatibility check is the extension |
| Moonraker queue and history | Wrap via HTTP | Documented, stable, and GPL-3.0 on a separate server, so no licence entanglement |
| Bambu history | Optional importer, mark as fragile | Reverse-engineered, tied to the closed plugin or account |
| Obico, OctoFarm, FDM Monster | Interoperate, do not embed | AGPL servers; running them next to us is fine, linking their code is not |
| SimplyPrint, 3DPrinterOS | Skip as backends for R1 | Proprietary hosted APIs with plan gates |

## Licence notes

- PrusaSlicer, OrcaSlicer (and Bambu Studio): AGPL-3.0. Copying `PartPlate`, `Model` or the backup code would make VSSlicer AGPL.
- Cura: LGPL-3.0 (Cura/LICENSE). Plugin and Python code can be read as reference; linking is allowed under LGPL terms.
- Obico server, OctoFarm, FDM Monster: AGPL-3.0. Mainsail, Fluidd: GPL-3.0. Moonraker: GPL-3.0 (moonraker@b559b9a:LICENSE).
- SimplyPrint, Bambu Farm Manager, 3DPrinterOS, Repetier-Server: proprietary.
- OpenBambuAPI documentation: GFDL-1.3. Facts about the protocol are used here, not its text.

## Open questions

- 3DPrinterOS API documentation and current pricing: only the vendor marketing page and third-party listings were reachable.
- Repetier-Server REST endpoints, job history and licence tiers: only the vendor's general page was read.
- Whether Bambu Farm Manager has a callable API, and whether it accepts multi-plate files yet. The wiki says single plate only.
- Whether `backup_interval` in Orca is minutes. The default is 10, but the unit was not confirmed in code.
- Uranium is cloned (`.reference/repos/Uranium`) but its `OperationStack` was not read, so Cura's undo limits are unknown.
- Whether plates should be addressable as files (for example `plate-1.json` next to the 3MF) for git-friendly diffs. The 3MF is a zip, which diffs poorly; a text sidecar could be needed.
