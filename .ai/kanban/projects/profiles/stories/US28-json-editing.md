---
id: US28
title: "A user edits profile JSON with completion and diagnostics"
status: reviewed
epic: VSS:E14
---

A user editing a profile file gets completion for `settings` keys and schema errors from the built-in JSON service, plus diagnostics for errors the schema cannot express.

## Acceptance criteria

- [ ] Completion inside `settings` offers catalogue keys; a wrong type shows a schema error
- [ ] An unknown parent gives a diagnostic within one second; cycle, unparsable `when` and unmapped key each have a diagnostic on the right line
- [ ] The shipped schema files equal the published E11 files

## Out of scope

- A custom text editor.
