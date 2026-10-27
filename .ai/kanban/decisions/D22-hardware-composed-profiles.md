---
id: D22
title: "Print profiles are computed from printer, toolhead, nozzle and material capabilities"
status: proposed
date: 2026-10-27
---

## Context

Owner request (2026-10-27). Every slicer models profiles badly: machine, filament and process
presets each repeat hardware facts, and compatibility is a hand-written list or condition
(`compatible_printers`, `compatible_printers_condition`; `docs/research/profiles.md` §Findings).
Nothing stops a profile from asking for ASA on a printer with no enclosure. The current schema
(`profile-api` `entities.ts`, from `profiles.md` §6) copies that shape: `PrinterModel`, `Nozzle`,
`Material`, `Process`, `PrinterInstance`, with compatibility as `when` conditions.

## Decision (proposed)

Four hardware entities state **capabilities** (what the hardware can do) or **requirements** (what
the material needs). The print profile is **derived** from them, never stored.

| Entity | Owns | Examples |
|---|---|---|
| `printer` (the frame, no printhead) | motion, bed, enclosure, frame sensors | kinematics, build volume, per-axis max speed/accel/jerk, bed heater max temp, chamber `{enclosed, heated, max_temp}`, door sensor, filtration, toolhead mounts, firmware flavour |
| `toolhead` | what moves on the gantry | part-cooling capacity, aux fan, extruder (direct/bowden, max push force), toolhead mass and its own accel limit, probe, accepted nozzle interface |
| `nozzle` | the hot end you swap | diameter, max volumetric throughput, max temperature, wear material (brass, hardened) |
| `material` | requirements | nozzle and bed temperature ranges, chamber min/max temperature, needs enclosure, abrasive, part-cooling range, its own max volumetric speed, density, shrinkage |

`derive(printer, toolhead, nozzle, material, intent) -> { profile, limits, verdict }`:

- **limits** take the tightest bound across the inputs: max flow = min(nozzle throughput, material
  max flow, extruder limit); max accel = min(frame axis limit, toolhead limit); chamber target is
  inside material range ∩ printer capability.
- **verdict** is a requirement check with a reason per failure: ASA needs a chamber ≥ 40 °C, the
  printer has no heated enclosure, so ASA is incompatible on that printer. Abrasive material on a
  brass nozzle fails the same way.
- **intent** (today's `process`) keeps only user choices: layer height, walls, infill, quality vs
  speed. Its speeds are targets that `limits` clamp. It holds no hardware numbers.
- Every derived value keeps a provenance trail (which entity set or capped it), reusing PRF-49's
  trail.

Import and export stay at the edge (an adapter layer). Importers split a slicer's machine, filament
and process presets into the four entities plus intent, and keep what they can't place in the
`native` part (D9's prefixed keys and `profiles.md` implication 4). Exporters write the derived
profile as Orca preset JSON (D9).

## Open questions for the owner

1. **Block or warn?** When a requirement fails, refuse to slice (as for ASA on an A1), or block
   with an explicit per-project "I know" override?
2. **Hot end placement.** Throughput and max temperature depend on the heater and melt zone as much
   as the nozzle tip. Treat `nozzle` as the swappable hot-end assembly (Bambu style), or split
   heater capacity into `toolhead`?
3. **Instance level.** Does a user's actual printer (a model plus mods: an enclosure added, a
   different toolhead) stay `printer_instance` pointing at the four, with overrides?

## Alternatives

- Keep the slicer shape (machine/filament/process with `when` conditions): cheapest to import, but
  it keeps the problem: compatibility by hand and hardware facts in three places.
- Constraint solver over every setting: more general, but most settings are plain user choices.
  Only the hardware bounds need constraints.

## Consequences

- `profile-api` domain: `PrinterModel` splits into `printer` and `toolhead`; `nozzle` gains
  throughput and temperature; `material` gains requirements; `Process` becomes `intent`. That is a
  breaking `profile-api` major.
- PRF-50 (`compatibleMaterials` / `compatibleProcesses` via `when`) is replaced by `verdict`, so
  it should stop until this is accepted. PRF-49's `resolveTuple` becomes the inheritance step in
  front of `derive`.
- Importer cards (Prusa, Orca, Cura) gain a decomposition step and need re-sizing.
- On acceptance: a planner (Opus) rewrites the PRF stories and cards under E11–E13 and re-sizes
  them with `.ai/plans/estimation.md`.
