---
id: US9
title: "Apply my overrides and see what fell back to the original profile"
status: reviewed
epic: VSS:E27
---

As a user who overrides settings per plate or per run, I want overrides to take effect even where Orca refuses them on the command line, and I want to be told about keys the schema does not model, so that nothing is silently dropped.

## Acceptance criteria

- [ ] Overrides go on the command line as `--key=value` where Orca accepts them and into the JSON where it refuses (43 keys, by class); a test per refused key class
- [ ] Keys the unified schema does not model fall back to the original imported native JSON; the keys that did are listed per slice
- [ ] Unknown and fallback keys are logged per slice and shown in the slice report as warnings
- [ ] A profile that omits thumbnail size and count is reported with the default (one 300x300 PNG) as a warning

## Out of scope

- Editing profiles (PRF)
