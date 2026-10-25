# Changelog

## 0.1.0

- Golden corpus under `test/fixtures` (OrcaSlicer, Bambu Studio, PrusaSlicer) with `manifest.json` and a `PROVENANCE.md` per folder; `scripts/slice-fixtures.sh` regenerates the Orca and Bambu Studio files.
- Golden-JSON harness: `test/golden/<file>.json` per corpus file, compared by `pnpm test`, rewritten by `pnpm golden:update`. Interim fields until the parser exists.
- The package exports nothing yet.
