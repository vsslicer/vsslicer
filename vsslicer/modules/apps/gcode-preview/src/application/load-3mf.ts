// SPDX-License-Identifier: AGPL-3.0-or-later
// Parse and plan one plate of a .gcode.3mf: pure Node/ES, the archive's bytes come from the caller.
import { gcode3mfPlates, gcode3mfSource, readGcode3mfPlate } from '@vsslicer/gcode-parser/gcode-3mf';
import { loadPreview, type LoadOptions, type Loaded } from './load-preview.ts';

const coded = (code: string, message: string) => Object.assign(new Error(message), { code });

/** Loads plate `plate` (default: the first) of the archive; its MD5 and size problems join the diagnostics. */
export const loadPlate = async (
  archive: Uint8Array,
  plate: number | undefined,
  opts: LoadOptions = {},
): Promise<Loaded> => {
  const numbers = gcode3mfPlates(archive);
  const n = plate ?? numbers[0];
  if (n === undefined) throw coded('no-plates', 'The archive has no sliced plate (Metadata/plate_N.gcode)');
  if (!numbers.includes(n)) throw coded('no-such-plate', `The archive has no plate ${n}`);
  const info = readGcode3mfPlate(archive, n);
  const loaded = await loadPreview('gcode', gcode3mfSource(archive, info.entry), opts);
  loaded.parsed.diagnostics.push(...info.diagnostics);
  loaded.plates = { numbers, plate: n, statistics: info.statistics, thumbnail: info.thumbnail };
  return loaded;
};
