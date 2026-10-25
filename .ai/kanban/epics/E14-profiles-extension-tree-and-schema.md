---
id: E14
title: Ship the vsslicer.profiles extension with profile tree, import commands and JSON Schema editing
status: reviewed
initiative: I3
project: PRF
order: 4
depends_on: [E13, E1]
rows: []
---

The first user-visible release of `vsslicer.profiles`: a profile tree in the explorer, commands to import from installed slicers and to download Prusa vendor bundles, a read-only "resolved profile" view, export to native formats, and validation of profile JSON files through VS Code's built-in JSON language service. It owns no feature-matrix row of its own; it is the extension shell that puts E11-E13's rows (vendor library, inheritance and conditions, nozzle entities, macro pass-through) in front of users, and the host for E15-E18.

## Scope
- In (written new, extension kind `workspace`): activation on `.vsslicer/profiles/**` or the view; `ProfileStore` (E13) hosted with its index in a worker; a `TreeView` grouped vendor › printer model › nozzle, plus materials, processes and printer instances, with abstract entities greyed, inheritance chain shown on expand, and a filter "compatible with printer instance X" from the evaluator.
- In: commands `Import from installed slicer` (lists what `locateInstalledSlicers()` found), `Download Prusa vendor bundle` (states the upstream URL and pinned commit before fetching, D4), `Show resolved profile` (a read-only virtual document with each key's provenance), `Export to PrusaSlicer/Orca/Bambu/Cura`, `Reveal parent`.
- In: `contributes.jsonValidation` mapping E11's JSON Schema onto `.vsslicer/profiles/**/*.json`, so completion, hover and schema errors come from the built-in JSON service; a `DiagnosticCollection` for errors the schema cannot express (unknown parent, cycle, unparsable `when`, unmapped key); an import report in an output channel with counts and diagnostics.
- Out: the settings form (E15), printer instances' connections and secrets (E16), the add-printer wizard (E17), bundle files (E18), a custom text editor (the JSON service is enough).

## Feature-matrix rows
None owned. Surfaces E11 (§13 Inheritance and compatibility conditions, §13 Nozzle or tool as its own entity), E12 (§13 Bundled vendor profile library) and E13 (§7 Placeholder macro language) to users.

## Acceptance criteria
- [ ] Integration tests (`@vscode/test-electron`, from E1) on a fixture workspace: tree shows the expected counts for an imported Orca vendor and for a fixture Prusa bundle; the compatibility filter hides incompatible materials.
- [ ] Editing a profile JSON file gives schema completion for `settings` keys and a diagnostic for an unknown parent within one second.
- [ ] `Download Prusa vendor bundle` shows URL and commit, writes only to `globalStorageUri`, and offline gives an error message with a retry action (no partial bundle left behind).
- [ ] `Show resolved profile` lists provenance per key; output matches `ProfileStore.resolve` for the E13 tuple fixtures.
- [ ] Import from installed slicer on fixture configuration folders for each OS layout; the source folders are unchanged afterwards (checksum test).
- [ ] Fixtures only (D5).

## Dependencies
- Needs E13 (and through it E11, E12), E1 (extension packaging, integration test harness).
- Exposes the extension API `vsslicer.profiles` (`getStore()`) and the tree for E15-E18; the commands are what SLC's printer/material pickers call (E26).

## Risks and spikes
- Multi-root workspaces: which folder holds user profiles. Proposal: the first folder with `.vsslicer/`, else the first folder; spike checks how VS Code orders folders in `workspaceFolders`.
- Remote and web hosts: `workspace` kind means the store runs where the files are; installed-slicer detection only works locally. Recorded as a limitation in the README.

## Eng review
- Scope: about 2 sprints. Considered merging with E15; kept apart because the extension shell (host code, commands, schema) and the webview form (UI) are different deliverables and E16 and E18 need the shell, not the form.
- Blast radius: the store index runs in a worker, so a 14 420-file vendor tree cannot stall the shared extension host; a crash in the worker restarts it and shows an error.
- Reversibility: every command writes new files only or asks first; uninstalling leaves the user's native slicer folders untouched.
- Zero silent failures: download, import and schema errors each have a message and a test above.
