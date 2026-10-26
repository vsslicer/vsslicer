// SPDX-License-Identifier: AGPL-3.0-or-later
import { readProject as readCore } from './adapters/model/resolveProject.ts';
import { readModel } from './adapters/model/readModel.ts';
import { createReadProject } from './application/readProject.ts';

/** The public entry point: a `Package` in, a `Project` out, dispatched on the detected dialect. No dialect reader is registered yet. */
export const readProject = createReadProject({
  readCore,
  readMetadata: (pkg) =>
    readModel(pkg.parts.find((p) => p.name === pkg.rootModel)?.bytes ?? new Uint8Array(), pkg.rootModel).metadata,
});
