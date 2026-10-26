// SPDX-License-Identifier: AGPL-3.0-or-later
import { SaxesParser } from 'saxes';
import type { CoreModel, CoreObject } from '../../domain/coreModel.ts';
import { MalformedXmlError } from '../../domain/errors.ts';
import type { Package } from '../../domain/package.ts';
import {
  IDENTITY,
  type Instance,
  type ModelObject,
  type ModelPart,
  type Transform,
} from '../../domain/project/project.ts';
import { composeTransforms } from '../model/resolveProject.ts';
import { readModelOnce } from '../model/readModelOnce.ts';
import { MAX_XML_DEPTH } from '../opc/xml.ts';

/*
 * Ported from OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp: model_settings.config parsing :4486-4533
 * (`<object>`, `<part>`/`<volume>`) and :4577-4626 (`<metadata>` to the object or its current part, plates aside),
 * build items to instances :4361-4410 and :4464-4472, the component walk :5171-5209, object metadata :2266-2304,
 * volumes :5212-5486, and the single-volume offset fix :2336-2357. Checked against
 * BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp :4446, :4549, :4571-4720, :5365-5611, :2347, :2410.
 * Copyright (c) Bambu Lab and the BambuStudio and OrcaSlicer contributors (AGPL-3.0; the file carries no per-file notice).
 */
export const MODEL_SETTINGS = 'Metadata/model_settings.config';
/** Rule 25: component references queued in one read (upstream's per-object `max_components`, :5177). */
export const MAX_COMPONENTS = 100_000;

type Pairs = [key: string, value: string][];
export interface PartSettings {
  /** Sub-object id the part describes (`<part id>`); absent for triangle-range volumes, which never match (:970-976). */
  readonly id?: number;
  readonly subtype?: string;
  readonly metadata: Pairs;
}
export interface ObjectSettings {
  readonly metadata: Pairs;
  readonly parts: PartSettings[];
}

const int = (value: string | undefined, what: string): number => {
  if (value === undefined || !/^-?\d{1,10}$/.test(value)) throw new Error(`${what} is not an integer`);
  return Number(value);
};

/**
 * Reads `model_settings.config` into object and part metadata by object id. `<object id>` starts an object (a duplicate
 * id fails), `<part>` or `<volume>` adds a part to it, and `<metadata key value>` goes to the open part, else the object;
 * a metadata without key is skipped, one inside `<plate>` is plate data (not read here), and one outside both fails.
 * Throws `MalformedXmlError` naming `part`.
 */
export function readModelSettings(bytes: Uint8Array, part: string): Map<number, ObjectSettings> {
  const parser = new SaxesParser();
  const objects = new Map<number, ObjectSettings>();
  let object: ObjectSettings | undefined;
  let volume: PartSettings | undefined;
  let plates = 0;
  let depth = 0;
  parser.on('opentag', (tag) => {
    if (++depth > MAX_XML_DEPTH) throw new Error(`elements nested deeper than ${MAX_XML_DEPTH}`);
    const attr = (n: string): string | undefined => tag.attributes[n];
    if (tag.name === 'plate') plates++;
    else if (tag.name === 'object') {
      const id = int(attr('id'), 'object id');
      if (objects.has(id)) throw new Error(`duplicate object id ${id} in model_settings.config`);
      object = { metadata: [], parts: [] };
      objects.set(id, object);
    } else if (tag.name === 'part' || tag.name === 'volume') {
      if (!object) throw new Error(`a ${tag.name} outside an object`);
      const ranged = attr('lastid') !== undefined && int(attr('lastid'), 'lastid') > 0;
      const id = attr('id');
      volume = {
        ...(!ranged && id !== undefined && { id: int(id, 'part id') }),
        ...(attr('subtype') !== undefined && { subtype: attr('subtype')! }),
        metadata: [],
      };
      object.parts.push(volume);
    } else if (tag.name === 'metadata') {
      const key = attr('key') ?? '';
      if (key === '' || plates > 0) return;
      if (!object) throw new Error(`metadata "${key}" outside an object`);
      (volume ?? object).metadata.push([key, attr('value') ?? '']);
    }
  });
  parser.on('closetag', (tag) => {
    depth--;
    if (tag.name === 'plate') plates--;
    else if (tag.name === 'object') object = volume = undefined;
    else if (tag.name === 'part' || tag.name === 'volume') volume = undefined;
  });
  try {
    parser.write(new TextDecoder().decode(bytes)).close();
  } catch (cause) {
    throw new MalformedXmlError(part, cause instanceof Error ? cause.message : String(cause), { cause });
  }
  return objects;
}

/** Last value of `key`, as upstream's in-order assignment leaves it. */
const lastOf = (pairs: Pairs, key: string): string | undefined => pairs.findLast(([k]) => k === key)?.[1];
const without = (pairs: Pairs, key: string): Map<string, string> => new Map(pairs.filter(([k]) => k !== key));

/** `_apply_transform` (:4464-4472): a non-finite or singular item transform leaves the instance at identity. */
function usable(t: Transform): boolean {
  const det =
    t[0] * (t[4] * t[8] - t[5] * t[7]) - t[1] * (t[3] * t[8] - t[5] * t[6]) + t[2] * (t[3] * t[7] - t[4] * t[6]);
  // shortcut: exact zero, where Eigen's fullPivLu uses a relative pivot threshold; tighten if near-singular files show up.
  return Number.isFinite(det) && det !== 0;
}

const withOffset = (t: Transform, x: number, y: number, z: number): Transform =>
  [...t.slice(0, 9), x, y, z] as unknown as Transform;

/**
 * Objects, parts and instances of a Bambu Studio / OrcaSlicer package. Each build item is an instance of its object
 * (one object per item target). The object's parts are its leaf meshes, found breadth first through components (an
 * object with components uses only them; missing targets and empty meshes are skipped), each with the composed
 * component transform; the mesh is shared, never copied. A `model_settings.config` object entry names the object and
 * gives its config (every metadata but `name`); its `<part id>` matching the leaf's own object id (same position first)
 * names the part (else the object name, `_2`, `_3`, ...), sets `subtype` and the part config as written. Without an
 * entry the name is the object's `name` attribute or `Object_<n>`. Triangle attributes (painting) stay raw per part.
 * Parts of an object with one part move their offset into the instances (:2336-2357).
 * Throws `MalformedXmlError` on a build item without its object and on a component walk over `MAX_COMPONENTS`.
 * shortcut: not ported, since they normalise rather than read: inside-out flipping, mesh_shared reuse, `extruder` clamping
 * (:2376-2400), the third-party instance split (:2141-2181) and the material colour to `extruder` mapping.
 */
export function readBambuObjects(pkg: Package): { objects: ModelObject[]; instances: Instance[]; notices: string[] } {
  const fail = (msg: string): never => {
    throw new MalformedXmlError(pkg.rootModel, msg);
  };
  const bytesOf = new Map(pkg.parts.map((p) => [p.name, p.bytes]));
  const models = new Map<string, Map<number, CoreObject> | undefined>();
  let root: CoreModel | undefined;
  /** Objects by id of the model at `path` (the root model when undefined), each part read once. */
  const modelAt = (path: string | undefined): Map<number, CoreObject> | undefined => {
    const name = path === undefined ? pkg.rootModel : path.replace(/^\//, '');
    if (!models.has(name)) {
      const bytes = bytesOf.get(name);
      const model = bytes && readModelOnce(bytes, name);
      if (path === undefined) root = model;
      models.set(name, model && new Map(model.objects.map((o) => [o.id, o])));
    }
    return models.get(name);
  };
  const settingsPart = pkg.parts.find((p) => p.name.toLowerCase() === MODEL_SETTINGS.toLowerCase());
  const settings = settingsPart ? readModelSettings(settingsPart.bytes, settingsPart.name) : new Map<number, never>();
  const notices: string[] = [];

  let queued = 0;
  const leavesOf = (root: CoreObject, path: string | undefined): { obj: CoreObject; at: Transform }[] => {
    const leaves: { obj: CoreObject; at: Transform }[] = [];
    const queue: { obj: CoreObject; path: string | undefined; at: Transform }[] = [{ obj: root, path, at: IDENTITY }];
    for (let i = 0; i < queue.length; i++) {
      const { obj, path: file, at } = queue[i]!;
      if (obj.components.length === 0) {
        if (obj.mesh && obj.mesh.triangles.length > 0) leaves.push({ obj, at });
        continue;
      }
      queued += obj.components.length;
      if (queued > MAX_COMPONENTS) fail(`cyclic or more than ${MAX_COMPONENTS} component references`);
      for (const c of obj.components) {
        const where = c.path ?? file;
        const target = modelAt(where)?.get(c.objectId);
        if (target) queue.push({ obj: target, path: where, at: composeTransforms(c.transform, at) });
        else
          notices.push(
            `Object ${obj.id} references object ${c.objectId}${where ? ` in ${where}` : ''}, which is missing: skipped.`,
          );
      }
    }
    return leaves;
  };

  const objects: ModelObject[] = [];
  const instances: Instance[] = [];
  const byItem = new Map<string, number>();
  const usedIds = new Set<number>();
  const firstInstance = new Map<number, number>();
  modelAt(undefined);
  for (const item of root?.build ?? fail('the root model is missing')) {
    const key = `${item.path ?? ''}|${item.objectId}`;
    let id = byItem.get(key);
    if (id === undefined) {
      const obj =
        modelAt(item.path)?.get(item.objectId) ?? fail(`can not find object id ${item.objectId} to builditem`);
      // Ids are unique in a project: an object from another part that clashes takes the next free id.
      id = item.objectId;
      while (usedIds.has(id)) id++;
      usedIds.add(id);
      byItem.set(key, id);
      firstInstance.set(id, instances.length);
      const entry = settings.get(item.objectId);
      const name = entry ? (lastOf(entry.metadata, 'name') ?? '') : obj.name || `Object_${objects.length + 1}`;
      let renamed = 0;
      const parts = leavesOf(obj, item.path).map(({ obj: leaf, at }, i): ModelPart => {
        const vols = entry?.parts ?? [];
        const vol = vols[i]?.id === leaf.id ? vols[i] : vols.find((v) => v.id === leaf.id);
        let partName = vol ? (lastOf(vol.metadata, 'name') ?? '') : '';
        if (partName === '') partName = renamed++ > 0 ? `${name}_${renamed}` : name;
        return {
          id: i,
          name: partName,
          mesh: leaf.mesh!,
          transform: at,
          ...(vol?.subtype !== undefined && { subtype: vol.subtype }),
          ...(leaf.triangleAttributes && { triangleAttributes: leaf.triangleAttributes }),
          config: without(vol?.metadata ?? [], 'name'),
        };
      });
      objects.push({ id, name, parts, config: without(entry?.metadata ?? [], 'name') });
    }
    instances.push({ objectId: id, transform: usable(item.transform) ? item.transform : IDENTITY });
  }

  // A lone part sits at the object origin: its offset moves into every instance (:2336-2357).
  const moved = new Map<number, ModelPart>();
  for (const [o, object] of objects.entries()) {
    const part = object.parts[0];
    if (object.parts.length !== 1 || !part) continue;
    const first = instances[firstInstance.get(object.id)!]!.transform;
    const world = composeTransforms(part.transform, first);
    if (world[9] === first[9] && world[10] === first[10] && world[11] === first[11]) continue;
    moved.set(object.id, part);
    objects[o] = { ...object, parts: [{ ...part, transform: withOffset(part.transform, 0, 0, 0) }] };
  }
  for (const [i, inst] of instances.entries()) {
    const part = moved.get(inst.objectId);
    if (!part) continue;
    const t = composeTransforms(part.transform, inst.transform);
    instances[i] = { ...inst, transform: withOffset(inst.transform, t[9], t[10], t[11]) };
  }
  return { objects, instances, notices };
}
