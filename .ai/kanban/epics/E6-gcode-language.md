---
id: E6
title: Add the G-code language: grammar, hovers and completion
status: reviewed
initiative: I1
project: GCP
order: 4
depends_on: [E1, E3]
rows: ["§10 G-code text editing (grammar, hovers on commands)"]
---

G-code text editing in `vsslicer.gcode` for people who read and edit G-code by hand: start and
end scripts, macros, calibration files, small prints. It contributes a `gcode` language with a
TextMate grammar, hovers that explain each command and its parameters for the file's firmware
flavour, and completion of commands and parameters. It works below VS Code's 50 MB document sync
limit; larger files are read in E5's text pane instead.

## Scope

In:
- Language contribution for `*.gcode`, `*.g`, `*.gco`, `*.nc` text, with comments, line numbers,
  checksums, parameters, string arguments, Klipper extended commands (`NAME KEY=value`) and the
  `[var]` / `{expr}` placeholder syntax highlighted (highlighting only; the catalogue is E50).
- Command catalogue as data: G and M codes with parameters, per flavour (Marlin 2, Prusa Buddy,
  Klipper, RRF, Bambu private codes as "undocumented" entries with what is known). Descriptions
  are written by us in our words and link to reprap.org/wiki/G-code, the Prusa Buddy page and
  the Klipper G-code reference; no upstream text is copied. Written new.
- Flavour detection reused from E3's header detection, overridable per file by a setting.
- Hover provider (command, parameters, units, flavour notes), completion provider (commands and
  parameters for the detected flavour), and slicer tag comments (`;TYPE:`, `; FEATURE:`)
  recognised with hovers.
- A status-bar item showing the detected flavour.

Out: placeholder catalogue and template editor (E50), macro evaluation (PRF §7 Placeholder macro
language), formatting and refactoring, diagnostics beyond unknown-command warnings, a language
server, language features over 50 MB (not possible with `TextDocument`).

## Feature-matrix rows

- **§10 G-code text editing (P0).** Done when a G-code file under 50 MB opens with highlighting,
  every catalogued command has a hover, and completion offers commands and parameters for the
  detected flavour.

## Acceptance criteria

- [ ] Grammar snapshot tests (vscode-tmgrammar-test) over E3 corpus excerpts from each slicer and
      hand-written Klipper and RRF macros; a grammar change that retokenises them fails
- [ ] Hover and completion integration tests in `@vscode/test-electron` per flavour, including a
      command whose meaning differs (M204 on Marlin vs Klipper, M572 on RRF vs Buddy)
- [ ] Catalogue lint: every entry has a source link and flavour list; CI fails on an entry
      without one
- [ ] A file over 50 MB opens in the preview by default and the language features say why they
      are unavailable instead of silently doing nothing
- [ ] Verified on fixtures only; the H2C plays no part

## Dependencies

- Needs E1 (packaging, test electron) and E3 (flavour detection, tag tables).
- Exposes the command catalogue as a data module in `@vsslicer/gcode` for E5's text pane
  hovers and E50's template language.

## Risks and spikes

- Bambu private M-codes have no public dictionary: catalogue only what inline comments in Orca's
  BBL templates say, marked unverified; no spike, the gap is stated in each hover.
- Grammar performance on 20-50 MB files (large-file mode turns tokenisation off past 20 MB):
  measure on the corpus; keep the grammar regex-light.

## Eng review

- Scope: the smallest epic in I1, about 2 sprints, and independent of E4 and E5, so it can run in
  parallel with them.
- The placeholder catalogue was moved out to E50 (I10, P2): the template editor needs PRF's
  profile store and macro language, which arrive in I3. This departs from the I1 text, which put
  "the language side" of that row here; the coordinator accepted the move to I10.
- A language server was rejected as more machinery than hovers and completion need; plain
  providers in the extension host are cheap and synchronous over small documents.
- Zero silent failures: unknown commands get a warning-level diagnostic only when the flavour is
  known; unknown flavour shows "generic" in the status bar.
