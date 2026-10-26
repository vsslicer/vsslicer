// SPDX-License-Identifier: AGPL-3.0-or-later
// Checked by `tsc -p tsconfig.test.json` (part of `pnpm test`): a field dropped, made optional or retyped fails to compile.
import { expectTypeOf, test } from 'vitest';
import type {
  EntityBase,
  Feeder,
  Material,
  Nozzle,
  Override,
  PrinterInstance,
  PrinterModel,
  Process,
  SettingValue,
  Surface,
  Vendor,
} from '../src/index.ts';

type Required_<T> = { [K in keyof T as object extends Pick<T, K> ? never : K]: T[K] };

test('shared fields exist on every entity but vendor', () => {
  expectTypeOf<keyof EntityBase>().toEqualTypeOf<
    'id' | 'inherits' | 'abstract' | 'when' | 'overrides' | 'settings' | 'renamed_from' | 'meta'
  >();
  expectTypeOf<Required_<EntityBase>>().toEqualTypeOf<{ id: string }>();
  expectTypeOf<PrinterModel>().toExtend<EntityBase>();
  expectTypeOf<Nozzle>().toExtend<EntityBase>();
  expectTypeOf<Surface>().toExtend<EntityBase>();
  expectTypeOf<Feeder>().toExtend<EntityBase>();
  expectTypeOf<Material>().toExtend<EntityBase>();
  expectTypeOf<Process>().toExtend<EntityBase>();
  expectTypeOf<PrinterInstance>().toExtend<EntityBase>();
  expectTypeOf<Vendor>().not.toHaveProperty('inherits');
  expectTypeOf<NonNullable<EntityBase['overrides']>[number]['match']>().toEqualTypeOf<'first' | 'all' | undefined>();
});

test('required fields', () => {
  expectTypeOf<keyof Required_<Vendor>>().toEqualTypeOf<'id' | 'name' | 'version' | 'license'>();
  expectTypeOf<keyof Required_<PrinterModel>>().toEqualTypeOf<
    'id' | 'vendor' | 'name' | 'technology' | 'bed' | 'toolheads'
  >();
  expectTypeOf<keyof Required_<Nozzle>>().toEqualTypeOf<'id' | 'diameter'>();
  expectTypeOf<keyof Required_<Surface>>().toEqualTypeOf<'id' | 'type'>();
  expectTypeOf<keyof Required_<Feeder>>().toEqualTypeOf<'id' | 'slots'>();
  expectTypeOf<keyof Required_<Material>>().toEqualTypeOf<'id' | 'vendor' | 'name' | 'type' | 'diameter'>();
  expectTypeOf<keyof Required_<Process>>().toEqualTypeOf<'id' | 'name' | 'layer_height'>();
  expectTypeOf<keyof Required_<PrinterInstance>>().toEqualTypeOf<'id' | 'model' | 'toolheads'>();
});

test('material, printer instance and override shapes', () => {
  expectTypeOf<NonNullable<Material['external_ids']>>().toEqualTypeOf<{
    cura_guid?: string;
    bambu_filament_id?: string;
    orca_filament_id?: string;
    prusa_name?: string;
  }>();
  expectTypeOf<Material['cost']>().toEqualTypeOf<{ amount: number; currency: string; per: 'kg' } | undefined>();
  expectTypeOf<PrinterInstance['toolheads']>().toEqualTypeOf<{ slot: number; nozzle: string }[]>();
  expectTypeOf<PrinterInstance['feeder']>().toEqualTypeOf<
    { type: 'mmu' | 'ams' | 'toolchanger'; slots: number } | undefined
  >();
  expectTypeOf<PrinterInstance['connection']>().toEqualTypeOf<
    { host_type: string; url: string; secret_ref: string } | undefined
  >();
  expectTypeOf<Override['when']>().toEqualTypeOf<string>();
});

test('setting values: scalar, keyed per-extruder map, null, {expr}', () => {
  expectTypeOf(0.4).toExtend<SettingValue>();
  expectTypeOf('gyroid').toExtend<SettingValue>();
  expectTypeOf(true).toExtend<SettingValue>();
  expectTypeOf(null).toExtend<SettingValue>();
  expectTypeOf({ '0': 0.4, '1': 0.6 }).toExtend<SettingValue>();
  expectTypeOf({ expr: '=math.ceil(speed_print * 30 / 70)' }).toExtend<SettingValue>();
  expectTypeOf(undefined).not.toExtend<SettingValue>();
});
