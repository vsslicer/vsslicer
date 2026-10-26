// SPDX-License-Identifier: AGPL-3.0-or-later
// Writes the synthetic inputs to a directory: `node test/support/record-synthetic.ts <dir>`.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SYNTHETIC, syntheticGcode } from './synthetic-gcode.ts';

const dir = process.argv[2];
if (!dir) throw new Error('usage: record-synthetic.ts <dir>');
for (const s of SYNTHETIC) writeFileSync(join(dir, `${s.name}.gcode`), syntheticGcode(s));
