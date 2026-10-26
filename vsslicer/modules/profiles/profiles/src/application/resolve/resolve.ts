// SPDX-License-Identifier: AGPL-3.0-or-later
// PRF-49: resolves a (printer instance, materials, process) tuple to unified settings, recording for every key the
// entity (and override block) that last set it. Merge rules are profile-api's `merge` (docs/research/profiles.md §6).
import {
  applyOverrides,
  merge,
  type ConditionContext,
  type EntityBase,
  type EntityByKind,
  type EntityKind,
  type PrinterInstance,
  type ProfileParts,
  type Settings,
} from '@vsslicer/profile-api';
import { clip } from '../import/registry.ts';

/** Materials one call accepts (caller input; more is refused). */
export const MAX_MATERIALS = 64;
/** Toolheads of one instance used; the rest are dropped with a diagnostic. */
export const MAX_TOOLHEADS = 64;
/** Parent visits per entity chain, so a diamond fan or a cycle cannot blow up. */
export const MAX_CHAIN = 256;

/** The entity that set a key: `override` is the index of its `overrides` block, absent for its own `settings`. */
export interface Source {
  kind: EntityKind;
  id: string;
  override?: number;
}

/**
 * Resolved key to its source. A printer key whose value or source differs between toolheads is a keyed map
 * `{"<slot>": value}` in the settings and has one entry per slot here, `<key>.<slot>`.
 */
export type Provenance = Record<string, Source>;

export interface TupleResolution {
  unified: ProfileParts<Settings>;
  provenance: ProfileParts<Provenance>;
  /** Unknown parents, cycles, chain overflow, unknown referenced entities, unreadable `when` blocks. */
  diagnostics: string[];
}

/** The store's read side; `IndexedStore` fits. */
export interface EntityReader {
  get<K extends EntityKind>(kind: K, id: string): Promise<EntityByKind[K] | undefined>;
}

interface Chain {
  kind: EntityKind;
  /** Parents left to right (depth first, repeats kept, as profile-api's `resolve` merges them), the entity last. */
  entities: EntityBase[];
}
interface Layer {
  settings: Settings;
  source: Source;
}
interface Part {
  settings: Settings;
  provenance: Provenance;
}
type Fields = Record<string, unknown>;

const own = <T>(o: Readonly<Record<string, T>>, k: string): T | undefined => (Object.hasOwn(o, k) ? o[k] : undefined);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

async function chainOf(kind: EntityKind, entity: EntityBase, reader: EntityReader, diags: string[]): Promise<Chain> {
  const entities: EntityBase[] = [];
  let visits = 0;
  const walk = async (e: EntityBase, path: string[]): Promise<void> => {
    for (const id of e.inherits ?? []) {
      const at = path.indexOf(id);
      if (at >= 0) {
        diags.push(
          clip(`${kind} "${e.id}": inheritance cycle ${[...path.slice(at), id].join(' -> ')}; parent skipped`),
        );
        continue;
      }
      if (++visits > MAX_CHAIN) {
        if (visits === MAX_CHAIN + 1)
          diags.push(clip(`${kind} "${entity.id}": more than ${MAX_CHAIN} parents in its chain; the rest skipped`));
        continue;
      }
      const parent = await reader.get(kind, id);
      if (!parent) {
        diags.push(clip(`${kind} "${e.id}" inherits from unknown parent "${id}"; resolved without it`));
        continue;
      }
      await walk(parent, [...path, id]);
    }
    entities.push(e);
  };
  await walk(entity, [entity.id]);
  return { kind, entities };
}

/** The chain's own fields and settings, for conditions: settings keys, then fields over them, then `settings`. */
function fieldsOf(c: Chain): Fields {
  const settings = merge(c.entities.map((e) => e.settings ?? {}));
  const rest = merge(c.entities.map(({ settings: _s, overrides: _o, inherits: _i, ...r }) => r as Fields));
  return { ...settings, ...rest, settings };
}

function layersOf(c: Chain, context: ConditionContext, diags: string[]): Layer[] {
  const layers: Layer[] = c.entities.flatMap((e) =>
    e.settings ? [{ settings: e.settings, source: { kind: c.kind, id: e.id } }] : [],
  );
  // arrays replace in a merge, so the last list in the chain is the entity's overrides
  const owner = c.entities.findLast((e) => e.overrides !== undefined && e.overrides !== null);
  if (!owner?.overrides) return layers;
  const blocks = owner.overrides;
  const r = applyOverrides({ id: owner.id, overrides: blocks }, context);
  for (const d of r.diagnostics) diags.push(clip(`${c.kind} "${owner.id}" ${d}`));
  for (const i of r.applied)
    layers.push({ settings: blocks[i]!.settings, source: { kind: c.kind, id: owner.id, override: i } });
  return layers;
}

function fold(layers: Layer[]): Part {
  const provenance: Provenance = Object.create(null);
  for (const l of layers)
    for (const [k, v] of Object.entries(l.settings)) if (v !== null && v !== undefined) provenance[k] = l.source;
  return { settings: layers.length ? merge(layers.map((l) => l.settings)) : {}, provenance };
}

/** One part per toolhead to one part: equal keys stay, the others become `{"<slot>": value}`. */
function combine(slots: number[], parts: Part[]): Part {
  if (parts.length === 1) return parts[0]!;
  const provenance: Provenance = Object.create(null);
  const entries: [string, Settings[string]][] = [];
  for (const k of new Set(parts.flatMap((p) => Object.keys(p.settings)))) {
    const values = parts.map((p) => own(p.settings, k));
    const sources = parts.map((p) => own(p.provenance, k));
    if (values.every((v) => same(v, values[0])) && sources.every((s) => same(s, sources[0]))) {
      entries.push([k, values[0]!]);
      if (sources[0]) provenance[k] = sources[0];
      continue;
    }
    const keyed: [string, Settings[string]][] = [];
    slots.forEach((slot, i) => {
      if (values[i] !== undefined) keyed.push([String(slot), values[i]]);
      if (sources[i]) provenance[`${k}.${slot}`] = sources[i];
    });
    entries.push([k, Object.fromEntries(keyed)]);
  }
  // fromEntries defines own properties, so a key named __proto__ stays data
  return { settings: Object.fromEntries(entries), provenance };
}

/**
 * Resolves a tuple of entity ids through `reader`. Each entity's chain is merged parents first; its `overrides` apply
 * in the context of the extruder in question (`nozzle.*` is that toolhead's nozzle). The printer part is, per
 * toolhead, the model, the nozzle, the surface and the instance in that order; material `i` runs on toolhead `i`
 * (slot order). Rejects when a passed id is unknown; anything the instance or a chain names that is missing gives a
 * diagnostic and a best-effort result.
 */
export async function resolveTuple(
  reader: EntityReader,
  printerInstance: string,
  materials: readonly string[],
  process: string,
): Promise<TupleResolution> {
  if (materials.length > MAX_MATERIALS) throw new RangeError(`more than ${MAX_MATERIALS} materials`);
  const diags: string[] = [];
  const required = async <K extends EntityKind>(kind: K, id: string) => {
    const e = await reader.get(kind, id);
    if (!e) throw new Error(clip(`unknown ${kind} "${id}"`));
    return e;
  };
  const optional = async <K extends EntityKind>(kind: K, id: string | undefined) => {
    if (id === undefined) return undefined;
    const e = await reader.get(kind, id);
    if (!e)
      diags.push(clip(`printer_instance "${printerInstance}" names unknown ${kind} "${id}"; resolved without it`));
    return e && chainOf(kind, e, reader, diags);
  };

  const instance: PrinterInstance = await required('printer_instance', printerInstance);
  const materialEntities = await Promise.all(materials.map((id) => required('material', id)));
  const processEntity = await required('process', process);

  const instanceChain = await chainOf('printer_instance', instance, reader, diags);
  // the instance's own fields through its chain (a user instance may inherit another)
  const inst = merge(instanceChain.entities.map(({ settings: _s, overrides: _o, ...r }) => r)) as PrinterInstance;
  let heads = [...(inst.toolheads ?? [])].sort((a, b) => a.slot - b.slot);
  if (heads.length > MAX_TOOLHEADS) {
    diags.push(clip(`printer_instance "${instance.id}": more than ${MAX_TOOLHEADS} toolheads; the rest dropped`));
    heads = heads.slice(0, MAX_TOOLHEADS);
  }
  const model = await optional('printer_model', inst.model);
  const surface = await optional('surface', inst.surface);
  const nozzles = await Promise.all(heads.map((h) => optional('nozzle', h.nozzle)));
  const materialChains = await Promise.all(materialEntities.map((m) => chainOf('material', m, reader, diags)));
  const processChain = await chainOf('process', processEntity, reader, diags);

  const materialFields = materialChains.map((c) => {
    const f = fieldsOf(c);
    return { ...f, base: f['base'] ?? f['id'] }; // Cura's `material.base`: a base material's id is its base_file
  });
  const printerFields = { ...(model ? fieldsOf(model) : {}), model: inst.model, instance: instance.id };
  const shared: ConditionContext = {
    printer: printerFields,
    process: fieldsOf(processChain),
    ...(surface && { surface: fieldsOf(surface) }),
    ...(inst.feeder && { feeder: inst.feeder }),
  } as ConditionContext;
  // toolhead `i`'s context: its nozzle, and the material it runs (material 0 for a toolhead without one)
  const contextOf = (i: number, material = materialFields[i] ?? materialFields[0]): ConditionContext =>
    ({
      ...shared,
      ...(nozzles[i] && { nozzle: fieldsOf(nozzles[i]) }),
      ...(material && { material }),
    }) as ConditionContext;

  const printerAt = (i: number) => {
    const ctx = contextOf(i);
    return fold([model, nozzles[i], surface, instanceChain].flatMap((c) => (c ? layersOf(c, ctx, diags) : [])));
  };
  // no toolheads (a Cura machine instance): one part without a nozzle
  const slots = heads.length ? heads.map((h) => h.slot) : [0];
  const printer = combine(
    slots,
    slots.map((_, i) => printerAt(i)),
  );
  // shortcut: material i past the last toolhead runs on toolhead 0 (a feeder); upgrade when instances map slots
  const materialParts = materialChains.map((c, i) =>
    fold(layersOf(c, contextOf(i < heads.length ? i : 0, materialFields[i]), diags)),
  );
  const processPart = fold(layersOf(processChain, contextOf(0), diags));

  return {
    unified: {
      printer: printer.settings,
      materials: materialParts.map((p) => p.settings),
      process: processPart.settings,
    },
    provenance: {
      printer: printer.provenance,
      materials: materialParts.map((p) => p.provenance),
      process: processPart.provenance,
    },
    diagnostics: [...new Set(diags)], // printer blocks run once per toolhead
  };
}
