# Tuple fixtures (PRF-128)

Test data only; not shipped (`files` in package.json lists `dist` only).

- `orca/` is cut from `OrcaSlicer@09aa0114:resources/profiles/` (2026-10-25).
- `bambu/` is cut from `BambuStudio@79df7ae:resources/profiles/` (2026-10-13).

Each tree holds the preset files of the tuples in `../oracle.ts` and every file their `inherits` and
`include` chains reach (plus each machine's `machine_model`), copied unmodified. The vendor index
files (`<Vendor>.json`) are the upstream ones with their four lists cut to those files, in upstream
order.

Licence: AGPL-3.0, as the upstream repositories (`docs/research/profiles.md`, "Licence notes").

`../golden/*.json` are OrcaSlicer CLI exports of these trees, normalised; they are profile data with
the same licence. Regenerate them with `node test/tuples/generate-golden.ts` (needs an OrcaSlicer
install; CI never runs it). The run that produced them used `OrcaSlicer-2.5.0-dev` (binary
2026-10-06).
