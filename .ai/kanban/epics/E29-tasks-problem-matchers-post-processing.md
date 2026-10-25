---
id: E29
title: Add slice, upload and print tasks with problem matchers and post-processing scripts
status: reviewed
initiative: I5
project: SLC
order: 4
depends_on: [E26, E27, E28, E20, E21, E7]
rows: ["§7 External post-processing scripts"]
---

Makes slicing a VS Code workflow: "slice", "upload" and "print" tasks from a task provider, problem matchers that put engine warnings in the Problems view, user post-processing scripts run as a task step after slicing, and the commands and status bar entries that close the I5 loop (open, slice, preview, print). It is for every slicing user, and for power users who already have Prusa or Orca post-processing scripts (klipper_estimator, custom tweaks).

## Scope

In:
- `registerTaskProvider` for task type `vsslicer`, with `slice` (engine, plate, profile triple), `upload` (sliced artefact to a printer through `PrinterRegistry`, E20) and `print` (upload and start); `CustomExecution` with a pseudoterminal that streams engine progress lines (`vscode-platform.md` §1 Tasks row). Tasks are definable in `tasks.json` and chainable with `dependsOn`.
- Problem matchers contributed in `package.json` for Orca, CuraEngine (and later Prusa) warning lines; warnings without a file location are attached to the plate's 3MF or the profile file.
- Post-processing: after a successful slice, run each script from the profile's `post_process` list (moved out of the engine preset by E27) or a workspace setting, in order, on a temp copy of the G-code, with the Prusa/Orca contract: G-code path as last argument, `SLIC3R_PP_OUTPUT_NAME`, `SLIC3R_PP_HOST`, and every config key as `SLIC3R_<KEY>` (`features-bambustudio-orcaslicer.md` §6). Runs before `.gcode.3mf` assembly so the archive carries the processed G-code and correct MD5.
- Scripts run only in a trusted workspace (Workspace Trust); untrusted workspaces show why the step was skipped.
- Commands "Slice plate", "Slice and preview" (opens the result with `GcodePreview.open`, E7) and "Slice and print"; status bar progress through `withProgress`.

Out: Cura's in-process Python `Script` classes (different API, needs Uranium; noted for E64 as possible built-ins), regex substitution (E64), fleet multi-printer send (PRN, I9), queue.

## Feature-matrix rows

- §7 External post-processing scripts (P1): done when a Prusa or Orca script runs unchanged against our output with the same environment it gets from those slicers, as a task step, with failures reported.

## Acceptance criteria

- [ ] Task provider integration tests (`@vscode/test-electron`): `slice`, `upload`, `print` resolve from `tasks.json`; `dependsOn` chains run in order; a failed `slice` stops `upload`
- [ ] Problem matcher tests on recorded engine output for each adapter: one Problems entry per warning, attached to the right file (regression: a changed engine warning format silently drops warnings)
- [ ] Post-processing environment snapshot test: the set and values of `SLIC3R_*` variables match those Orca sets for the same preset (oracle: a recording from the pinned Orca running a fixture `post_process` script that dumps its environment)
- [ ] klipper_estimator fixture: a script rewrites the time estimate and the final `.gcode.3mf` MD5 matches the processed G-code
- [ ] A non-zero script exit, a timeout, or a script that deletes its input each produce a task failure naming the script; the unprocessed G-code is kept in the temp directory and nothing is moved into `.vsslicer/sliced/`
- [ ] Untrusted workspace: scripts are not run and the task output says so
- [ ] End to end on the owner's machine: a Bambu 3MF with an imported profile is sliced, previewed in `vsslicer.gcode` and printed on the H2C via `vsslicer.bambu` (firmware and Orca versions recorded, D5); CI runs the same chain against the fake MQTT broker and FTPS fixture from PRN

## Dependencies

- Needs E26, E27 (emission and output assembly; E27 strips `post_process`), E28 (Cura warnings), E20 (`PrinterRegistry.upload`, job start), E21 (H2C send), E7 (`GcodePreview.open`).
- Exposes the `vsslicer` task type and its definition schema, the problem matcher names (`$vsslicer-orca`, `$vsslicer-cura`), and a post-processing step runner reused by E64 (regex substitution as a built-in step).

## Risks and spikes

- Risk: Prusa 3.0 stubbed the `SLIC3R_<KEY>` export (feature matrix §7), so scripts written for 3.0 may expect less; we follow Orca's full export.
- Risk: Windows script invocation (`.py`, `.ps1`, `.bat`) differs; resolve the interpreter the way Orca does (by extension) and test on the Windows runner.
- Spike (small): whether `CustomExecution` pseudoterminal output can feed problem matchers in all supported VS Code versions; fallback is a `ShellExecution` wrapper around a small Node CLI of ours.

## Eng review

- Scope challenge: post-processing, tasks and the end-to-end commands are one epic because they share the task pipeline and the I5 end-to-end criterion lands here; upload and print are thin calls into PRN, not new printer code.
- Security: scripts are user code run on the user's machine; gated by Workspace Trust, never taken from an untrusted 3MF's embedded config (a 3MF's `post_process` is shown and requires explicit confirmation).
- Zero silent failures: every step failure stops the chain and names the step; added the "script deleted its input" case after review.
- Reversibility: post-processing can be disabled per workspace; tasks are opt-in definitions.
