// SPDX-License-Identifier: AGPL-3.0-or-later
import { scanModel } from './adapters/opc/modelScan.ts';
import { addContentType, dropRelationshipsTo, removeContentType } from './adapters/opc/opcEdit.ts';
import { readPackage, resolveTarget } from './adapters/opc/opc.ts';
import { openZip } from './adapters/zip/fflateZip.ts';
import { writeZip } from './adapters/zip/zipWriter.ts';
import { createOpenPackage } from './application/openPackage.ts';

/** The public entry point: 3MF bytes in, `OpenedPackage` out, or a typed `ThreeMfError`. Wires the default adapters. */
export const openPackage = createOpenPackage({
  openZip,
  readPackage,
  scanModel,
  writeZip,
  addContentType,
  removeContentType,
  dropRelationshipsTo,
  resolveTarget,
});
