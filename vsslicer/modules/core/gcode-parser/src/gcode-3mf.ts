// SPDX-License-Identifier: AGPL-3.0-or-later
// Subpath entry: pulls @vsslicer/3mf, which the main entry must not.
export { gcode3mfEntries, gcode3mfSource } from './adapters/gcode-3mf-source.ts';
export { CorruptZipError, SizeCapExceededError } from '@vsslicer/3mf';
export { gcode3mfPlates, readGcode3mfPlate } from './adapters/gcode-3mf-plate.ts';
export type { Gcode3mfPlate, PlateFilament, PlateStatistics } from './adapters/gcode-3mf-plate.ts';
