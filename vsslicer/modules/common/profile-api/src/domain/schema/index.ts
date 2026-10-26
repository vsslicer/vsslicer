// SPDX-License-Identifier: AGPL-3.0-or-later
import { defsSchema, type JsonSchema } from './defs.ts';
import { feederSchema } from './feeder.ts';
import { materialSchema } from './material.ts';
import { nozzleSchema } from './nozzle.ts';
import { printerInstanceSchema } from './printer-instance.ts';
import { printerModelSchema } from './printer-model.ts';
import { processSchema } from './process.ts';
import { surfaceSchema } from './surface.ts';
import { vendorSchema } from './vendor.ts';

export type { JsonSchema };
export const entitySchemas = {
  vendor: vendorSchema,
  printer_model: printerModelSchema,
  nozzle: nozzleSchema,
  surface: surfaceSchema,
  feeder: feederSchema,
  material: materialSchema,
  process: processSchema,
  printer_instance: printerInstanceSchema,
} as const satisfies { [entity: string]: JsonSchema };

/** Every schema, shared $defs first: register them all in a validator before compiling any. */
export const allSchemas: JsonSchema[] = [defsSchema, ...Object.values(entitySchemas)];
export { defsSchema };
