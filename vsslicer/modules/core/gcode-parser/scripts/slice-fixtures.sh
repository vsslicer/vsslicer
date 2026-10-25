#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
# Regenerates the OrcaSlicer and Bambu Studio fixtures in test/fixtures from generated STL models,
# using the locally installed apps' CLIs (macOS). The PrusaSlicer files are copied from
# .reference/repos (see their PROVENANCE.md); this script does not touch them.
# Orca profile JSON is read as data from the cloned OrcaSlicer repo (its bundled profiles are packed).
# Usage: scripts/slice-fixtures.sh, then pnpm golden:update (files carry a generation timestamp, so hashes change)
set -euo pipefail

mod="$(cd "$(dirname "$0")/.." && pwd)"
repo="$(cd "$mod/../../.." && pwd)"
fx="$mod/test/fixtures"
orca=/Applications/OrcaSlicer.app/Contents/MacOS/OrcaSlicer
bs=/Applications/BambuStudio.app/Contents/MacOS/BambuStudio
bsres=/Applications/BambuStudio.app/Contents/Resources/profiles/BBL
oprof="$repo/.reference/repos/OrcaSlicer/resources/profiles"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/datadir" "$fx/orca" "$fx/bambu-studio"

node "$mod/scripts/make-model.mjs" cube 20 "$work/cube20.stl"
node "$mod/scripts/make-model.mjs" cube 10 "$work/cube10.stl"
node "$mod/scripts/make-model.mjs" cylinder 20 10 "$work/cylinder.stl"

# set_key <in.json> <out.json> <key> <value>: copy a profile with one setting overridden
set_key() {
  node -e '
    const fs = require("node:fs");
    const [i, o, k, v] = process.argv.slice(1);
    const p = JSON.parse(fs.readFileSync(i, "utf8"));
    p[k] = v; p.name = "fixture"; p.from = "user"; delete p.setting_id;
    fs.writeFileSync(o, JSON.stringify(p));
  ' "$@"
}
flat() { node "$mod/scripts/flatten-profile.mjs" "$1" "$2" "$oprof/BBL" "$oprof/Custom" "$oprof/OrcaFilamentLibrary"; }

# orca <out-name> <machine> <process> <filament[;filament]> <ids> <models...>
orca_slice() {
  local name="$1" machine="$2" process="$3" fil="$4" ids="$5"; shift 5
  local d="$work/o-$name"; rm -rf "$d"; mkdir -p "$d"
  (cd "$work" && "$orca" --datadir datadir --arrange 1 --orient 0 \
    --load-settings "$machine;$process" --load-filaments "$fil" --load-filament-ids "$ids" \
    --slice 0 --outputdir "$d" "$@" >"$d/log.txt" 2>&1) || { cat "$d/log.txt"; exit 1; }
  mv "$d/plate_1.gcode" "$fx/orca/$name.gcode"
}
bs_slice() {
  local name="$1" process="$2"; shift 2
  local d="$work/b-$name"; rm -rf "$d"; mkdir -p "$d"
  (cd "$work" && "$bs" --datadir datadir --arrange 1 --orient 0 \
    --load-settings "$bsres/machine/Bambu Lab X1 Carbon 0.4 nozzle.json;$process" \
    --load-filaments "$bsres/filament/Bambu PLA Basic @BBL X1C.json" \
    --slice 0 --outputdir "$d" "$@" >"$d/log.txt" 2>&1) || { cat "$d/log.txt"; exit 1; }
  mv "$d/plate_1.gcode" "$fx/bambu-studio/$name.gcode"
}

# --- OrcaSlicer: generic Marlin printer, and the Bambu Lab X1 Carbon profile
flat "$work/marlin-m.json" "$oprof/Custom/machine/MyMarlin 0.4 nozzle.json"
flat "$work/marlin-p.json" "$oprof/Custom/process/0.20mm Standard @MyMarlin.json"
flat "$work/pla.json" "$oprof/OrcaFilamentLibrary/filament/Generic PLA @System.json"
# the profile uses relative extrusion; Orca requires G92 E0 each layer
set_key "$work/marlin-m.json" "$work/marlin-m2.json" layer_change_gcode "G92 E0"
orca_slice cube-marlin "$work/marlin-m2.json" "$work/marlin-p.json" "$work/pla.json" 1 "$work/cube20.stl"

flat "$work/x1c-m.json" "$oprof/BBL/machine/Bambu Lab X1 Carbon 0.4 nozzle.json"
flat "$work/x1c-p.json" "$oprof/BBL/process/0.20mm Standard @BBL X1C.json"
flat "$work/x1c-f.json" "$oprof/BBL/filament/Bambu PLA Basic @BBL X1C.json"
node -e '
  const fs = require("node:fs");
  const f = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  for (const [file, colour] of [["red", "#FF0000"], ["blue", "#0000FF"]]) {
    fs.writeFileSync(process.argv[2] + "/" + file + ".json", JSON.stringify({ ...f, name: file, filament_colour: [colour], default_filament_colour: [colour] }));
  }
' "$work/x1c-f.json" "$work"
orca_slice cube-x1c "$work/x1c-m.json" "$work/x1c-p.json" "$work/x1c-f.json" 1 "$work/cube20.stl"
orca_slice two-material-x1c "$work/x1c-m.json" "$work/x1c-p.json" "$work/red.json;$work/blue.json" 1,2 "$work/cube10.stl" "$work/cube10.stl"
for arc in on off; do
  set_key "$work/x1c-p.json" "$work/x1c-p-arc-$arc.json" enable_arc_fitting "$([ $arc = on ] && echo 1 || echo 0)"
  orca_slice "cylinder-arcs-$arc-x1c" "$work/x1c-m.json" "$work/x1c-p-arc-$arc.json" "$work/x1c-f.json" 1 "$work/cylinder.stl"
done

# --- Bambu Studio: Bambu Lab X1 Carbon, one filament
bs_slice cube "$bsres/process/0.20mm Standard @BBL X1C.json" "$work/cube20.stl"
for arc in on off; do
  set_key "$bsres/process/0.20mm Standard @BBL X1C.json" "$work/b-arc-$arc.json" enable_arc_fitting "$([ $arc = on ] && echo 1 || echo 0)"
  bs_slice "cylinder-arcs-$arc" "$work/b-arc-$arc.json" "$work/cylinder.stl"
done

ls -l "$fx/orca" "$fx/bambu-studio"
