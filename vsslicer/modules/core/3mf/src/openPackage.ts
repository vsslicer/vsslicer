// SPDX-License-Identifier: AGPL-3.0-or-later
import { scanModel } from './adapters/opc/modelScan.ts';
import { readPackage } from './adapters/opc/opc.ts';
import { openZip } from './adapters/zip/fflateZip.ts';
import { createOpenPackage } from './application/openPackage.ts';

/** The public entry point: 3MF bytes in, `OpenedPackage` out, or a typed `ThreeMfError`. Wires the default adapters. */
export const openPackage = createOpenPackage({ openZip, readPackage, scanModel });
