// SPDX-License-Identifier: AGPL-3.0-or-later
import { readProject as readCore } from './adapters/model/resolveProject.ts';
import { readModel } from './adapters/model/readModel.ts';
import { createReadProject } from './application/readProject.ts';
import { createBambuReader } from './adapters/bambu/readBambu.ts';
import { createCuraReader } from './adapters/cura/readCura.ts';
import { readPrusa2 } from './adapters/prusa/readPrusa2.ts';

/** The public entry point: a `Package` in, a `Project` out, dispatched on the detected dialect. */
export const readProject = createReadProject({
  readCore,
  readers: new Map([
    ['bambu', createBambuReader('bambu')],
    ['orca', createBambuReader('orca')],
    ['cura', createCuraReader(readCore)],
    ['prusa2', readPrusa2],
  ]),
  readMetadata: (pkg) =>
    readModel(pkg.parts.find((p) => p.name === pkg.rootModel)?.bytes ?? new Uint8Array(), pkg.rootModel).metadata,
});
