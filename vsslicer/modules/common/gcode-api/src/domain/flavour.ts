// SPDX-License-Identifier: AGPL-3.0-or-later
/** Firmware dialect: it decides units (M203 mm/s vs mm/min, M106 `S` scale) and the default limits. */
export type Flavour = 'marlin' | 'klipper' | 'reprapfirmware';

// Cura: `;FLAVOR:Marlin` is "RepRap (Marlin/Sprinter)"; Griffin/Cheetah are Marlin-based Ultimaker firmware (CuraEngine@47b0388 include/settings/EnumSettings.h:197-214).
// UltiGCode (UM2, volumetric E, own firmware) stays unknown, so callers can report it as assumed.
const MARLIN_NAMES = new Set([
  'marlin',
  'marlin2',
  'marlinlegacy',
  'marlin(volumetric)',
  'reprap (marlin/sprinter)',
  'reprap (volumetric)',
  'griffin',
  'cheetah',
]);
// Cura writes `;FLAVOR:RepRap` for "RepRap (RepRap)", the original RepRap firmware family (gcodeExport.cpp:210-211, Settings.cpp:397-398).
const RRF_NAMES = new Set(['reprapfirmware', 'reprap', 'reprap (reprap)']);

/** Maps a `gcode_flavor` / `;FLAVOR:` name to a flavour; `undefined` for an unknown name. */
export function flavourFromName(name: string): Flavour | undefined {
  const n = name.trim().toLowerCase();
  if (n === 'klipper') return 'klipper';
  if (RRF_NAMES.has(n)) return 'reprapfirmware';
  return MARLIN_NAMES.has(n) ? 'marlin' : undefined;
}
