---
id: E32
title: Turn vsslicer.project into an editor with undo, hot-exit backup and the project folder
status: reviewed
initiative: I6
project: VWR
order: 5
depends_on: [E10, E31]
rows: ["§9 Undo, redo, autosave, crash recovery", "§9 Project folder with queue and history sidecars", "§4 Several projects open at once"]
---

This epic makes the viewer an editor without adding any editing tool yet: an editable `ProjectModel` changed only through command objects, VS Code's undo, redo, dirty marker, save, revert and hot-exit backup wired to it, the `.vsslicer/` project folder layout, and correct behaviour with several projects in a multi-root workspace. Every later editor epic adds commands to this core.

## Scope

In (`vsslicer.project`, written new):
- `CustomEditorProvider` replacing the readonly provider behind the setting `vsslicer.project.editing` (default on once this epic ships; off returns to viewer mode).
- Command-object edit history in the extension host (Cura's approach, `projects-and-fleet.md` §5): each command has `apply` and `invert`, commands group into one undo step, each step fires `CustomDocumentEditEvent`. No mesh snapshots.
- Webview sends commands, never state; on reload it replays the model from the host.
- Save and Save As through E31; revert; `backupCustomDocument` writes the original-bytes reference plus the command log (compact), not a full 3MF; restore after a crash or hot exit replays it.
- External change detection: the file changed on disk while dirty prompts reload or keep.
- `.vsslicer/` folder beside the 3MF: `sliced/` (engine outputs), and reserved `queue.json` and `history/` paths whose content PRN owns (I9); a `README` line in the folder; a recommended `.gitignore` entry.
- Multi-root: projects in every workspace folder are found; one editor per document, split views allowed (`supportsMultipleEditorsPerDocument`).
- A starter command set to prove the core: rename object, delete object, set object transform (matrix). The gizmos are E33.

Out: the editing tools (E33 to E37); queue and history content (PRN, I9).

## Feature-matrix rows

- §9 Undo, redo, autosave, crash recovery (P1): done when every command is undoable through VS Code's stack and an unsaved project survives a window reload and a killed extension host.
- §9 Project folder with queue and history sidecars (P1): done when `.vsslicer/` is created on first need with the documented layout and PRN can read and write its reserved paths through `ProjectModel.folder`.
- §4 Several projects open at once (P1): done when two projects in two workspace folders edit, undo and save independently in one window.

## Acceptance criteria

- [ ] Property test: any random sequence of commands followed by the same number of undos returns a model equal to the start; redo returns to the end.
- [ ] Hot exit: dirty project, reload window, the edits are back and the document is still dirty; same after killing the extension host process (integration test with `@vscode/test-electron`).
- [ ] Backup size for a 100 MB project after 50 transform edits stays under 1 MB (command log, not meshes).
- [ ] Save while the webview is hidden works (the custom-editor contract).
- [ ] File changed on disk while dirty shows the reload or keep choice; neither choice loses the user's edits silently.
- [ ] Two projects in a multi-root workspace: undo in one never touches the other.
- [ ] Setting off returns to read-only viewing without losing an open project's unsaved edits (the user is asked to save first).
- [ ] Verified only on fixtures and in the VS Code test host (D5).

## Dependencies

- Needs E10 (viewer, `ProjectModel`), E31 (writer for save).
- Exposes `ProjectModel.execute(command)`, the `Command` interface, change events and `ProjectModel.folder` (the `.vsslicer/` URIs) to E33 to E55, to SLC (writes `sliced/`) and to PRN (queue and history, I9).

## Risks and spikes

- Backup timing: VS Code calls `backupCustomDocument` about a second after edits stop (`3d-viewer.md` §5); a very long log could still be slow. Spike: compact the log on save and cap it, measured with 10,000 commands.
- Command replay after a schema change between versions: the log carries a version and an incompatible log falls back to "open the last saved file" with a message.

## Eng review

- Scope challenge: core only, with three trivial commands so the epic is testable on its own; the alternative (folding undo into E33) would make E33 two epics' worth.
- Tests: the inverse property catches non-invertible commands in every later epic, because each epic must register its commands with this generator.
- Blast radius: undo bugs corrupt a user's document; the property test and the save-to-temp rule in E31 limit the damage.
- Reversibility: the `vsslicer.project.editing` flag.
- Changed because of the review: backup stores a log instead of a 3MF (cost), and the log carries a version (replay across upgrades).
