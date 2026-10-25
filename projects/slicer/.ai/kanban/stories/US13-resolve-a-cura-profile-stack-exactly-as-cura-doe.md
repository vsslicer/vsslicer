---
id: US13
title: "Resolve a Cura profile stack exactly as Cura does"
status: reviewed
epic: VSS:E28
---

As a user with Cura profiles, I want VSSlicer to compute the final value of every setting from the definition, variant, material, quality, intent and user containers, so that CuraEngine, which resolves nothing, gets a complete and correct settings set.

## Acceptance criteria

- [ ] For a fixture set of (machine, extruder count, material, quality) tuples every resolved value equals the value Cura computes; the oracle is a table exported once from a pinned Cura release and committed with the Cura version recorded
- [ ] The evaluator supports the Python-expression subset in `fdmprinter.def.json` (`resolveOrValue`, `extruderValue(s)`, `anyExtruderWithMaterial`, `defaultExtruderPosition`, `math.*`)
- [ ] An unsupported function fails resolution with the setting key and function named, never a silent default; unsupported functions are listed per profile at import time
- [ ] `resolveCuraStack(stack): ResolvedCuraSettings` is exported for PRF's settings form; PRF builds no second evaluator
- [ ] Ported Uranium `SettingFunction` semantics carry the notice and a `Ported from` line (D2)

## Out of scope

- Cura's Python `Script` post-processing (E29 runs external scripts only)
