---
id: US61
title: "Apply my Prusa regex substitutions to Orca and Cura output"
status: reviewed
epic: VSS:E64
---

As a user with Prusa substitution rules in my profiles, I want them applied to Orca and CuraEngine output, so that I keep my G-code edits.

## Acceptance criteria

- [ ] A built-in post-processing step reads `gcode_substitutions` from imported profiles and Cura's SearchAndReplace parameters and applies Prusa semantics (find, replace, flags `i`, `w`, `m`, `s`) to the sliced output
- [ ] Results equal PrusaSlicer 2.9.x for the same rules on the same G-code (oracle: pairs sliced by the pinned PrusaSlicer with and without the rules)
- [ ] Test vectors come from Prusa's documented examples and unit tests where they exist
- [ ] An invalid or unsupported pattern fails the slice naming the rule; Boost-versus-JavaScript differences are listed and tested
- [ ] The step runs before `.gcode.3mf` assembly so MD5 and metadata stay right, and is skipped when the Prusa engine applies the rules itself

## Out of scope

- Writing a rule editor
