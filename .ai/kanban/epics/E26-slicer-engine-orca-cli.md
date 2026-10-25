---
id: E26
title: Define the SlicerEngine interface, detect or download engines, drive the Orca CLI
status: reviewed
initiative: I5
project: SLC
order: 1
depends_on: [E1, E19]
rows: []
---

Delivers the core of `vsslicer.slicer`: one `SlicerEngine` interface every engine adapter implements, detection of a user-installed OrcaSlicer, an opt-in download of the pinned upstream Orca release, and the first adapter, which drives the Orca CLI as a child process with typed errors, progress and cancel. It is for every user who wants to slice inside VS Code, and for the other SLC epics, which plug further engines and outputs into the same interface. Under D2 the process boundary is an engineering choice (crash and memory containment), not a licence one; the upstream Orca CLI is still first because it is the fastest route to a tested loop.

## Scope

In:
- `vsslicer.slicer` extension (workspace kind), new code. The interface follows `slicing-engine-embedding.md` §6 item 1: `slice(job): AsyncIterable<Progress|Warning|Layer>` resolving to output paths, plus `cancel()`; exported as `Slicer.slice(job)` (roadmap extension table).
- Engine registry: detection of installed Orca on macOS, Windows and Linux (standard install paths, a user setting `vsslicer.slicer.orca.path`), version probe, and a download of the pinned upstream release into `globalStorageUri` after the user confirms. Each pinned release has a SHA-256 in our manifest; a mismatch refuses the binary.
- Orca CLI adapter: argv array with no shell, `--slice N`, `--load-settings`, `--load-filaments`, `--outputdir` in a temp directory; exit-code table from `OrcaSlicer@09aa0114:src/libslic3r/Utils.hpp:43-95` read as a signed byte; `--pipe` JSON progress and `result.json` on Linux, indeterminate progress elsewhere; cancel kills the process tree (SIGTERM, `taskkill /T` on Windows); output is moved into `.vsslicer/sliced/` only on success.
- The adapter takes already-written preset files as input; producing them is E27.

Out: preset emission and `.gcode.3mf` assembly (E27), CuraEngine (E28), tasks and post-processing (E29), the capability matrix (E30), the PrusaSlicer adapter (E65), any bundled or embedded engine (E66). No code is ported; the adapter is new code reading the upstream CLI contract.

## Feature-matrix rows

None directly. This epic is the substrate the rows of E27 to E30 ride on; the I5 exit criteria for typed exit codes, cancel and engine download are met here.

## Acceptance criteria

- [ ] `SlicerEngine` interface and its TypeScript types are published from `vsslicer.slicer` and documented, with a fake engine used by unit tests (vitest)
- [ ] Every row of the Orca exit-code table maps to a typed error with a user-visible message; one test per code, using a stub binary that exits with that code (regression: a new code or modulo-256 wrap shows as "unknown error")
- [ ] Cancel during slicing kills the process tree within 2 s and leaves no file in `.vsslicer/sliced/` (test with a stub that sleeps; then with the pinned Orca on a large fixture in CI)
- [ ] A crash (signal) or timeout of the engine produces an error notification and never blocks the extension host (integration test with `@vscode/test-electron`)
- [ ] On Linux CI, the pinned Orca release slices the fixture plate set; `--pipe` progress reaches 100 and `result.json` is read; `@vsslicer/gcode` (E3) parses the output with the expected layer count
- [ ] On macOS and Windows, a slice completes with indeterminate progress (CI on free GitHub Actions runners, D5)
- [ ] Download: checksum mismatch, offline and HTTP errors each produce a distinct message and leave no partial binary (tests with a local HTTP fixture server)
- [ ] Detection finds an installed Orca and reports its version; an unsupported version shows a warning naming the pinned version
- [ ] On the owner's machine, a fixture Bambu 3MF plate is sliced with the installed Orca for the H2C machine profile; Orca version and date recorded (D5); the rest is fixtures only

## Dependencies

- Needs E1 (monorepo, CI with pinned engine download and cache, vitest, `@vscode/test-electron`).
- Uses E3 as the test oracle for output parsing.
- E19 only if the daemon later hosts long slices; not required for this epic.
- Exposes `SlicerEngine`, the engine registry and `Slicer.slice(job)` to E27 to E30, E65, E66, and to PRN (I9 fleet send of sliced output).

## Risks and spikes

- Spike: macOS quarantine and Gatekeeper on an Orca downloaded into `globalStorageUri` (`slicing-engine-embedding.md` open questions). Outcome decides whether download is offered on macOS or only detection; no notarisation budget exists (D5).
- Spike: Orca `--debug` progress text on macOS and Windows; parse it only if stable across two pinned releases, else keep indeterminate progress. Optionally upstream a cross-platform `--pipe` (ENG §6 item 2).
- Spike: Orca on headless Linux CI: AppImage extraction without FUSE, and whether `xvfb-run` is needed (the CLI exits 1 without a display in some paths, ENG §1).
- Risk: the pinned Orca release must carry an H2C machine profile; if not, the adapter is pointed at the Bambu Studio CLI (same CLI lineage, ENG §1) as a configured variant. Unverified.

## Eng review

- Scope challenge: kept to interface, registry and one adapter. Emission was moved out to E27 so this epic is testable with hand-written fixture presets; this is the smallest unit that proves the child-process contract.
- Tests: each error class has a stub-binary test; the real engine runs only in CI with pinned versions so upstream drift shows as a pinned-version bump, not a flaky test.
- Blast radius: all engine work is a child process; the host only reads lines and files. A hung engine is bounded by a timeout setting.
- Reversibility: engines sit behind `vsslicer.slicer.engine`; rolling back an Orca pin is a manifest change.
- Zero silent failures: unknown exit codes, empty output directories and missing `plate_N.gcode` all raise typed errors (added after review; the first draft trusted exit 0).
