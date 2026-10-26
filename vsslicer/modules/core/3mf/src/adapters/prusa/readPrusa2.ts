// SPDX-License-Identifier: AGPL-3.0-or-later
// PrusaSlicer 2.x project reader. Ported from PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/3mf_legacy.cpp
// (AGPL-3.0-or-later), Copyright (c) Prusa Research 2018 - 2023 Oleksandra Iushchenko, David Kocik, Enrico Turri,
// Lukas Matena, Lukas Hejl, Filip Sykala, Vojtech Bubnik, Tomas Meszaros; Copyright (c) 2020 Henner Zeller.
// Line references are to the released loader it was kept from, PrusaSlicer-2.9@b028299:src/libslic3r/Format/3mf.cpp.
import { SaxesParser } from 'saxes';
import type { DialectReader } from '../../application/readProject.ts';
import type { CoreObject } from '../../domain/coreModel.ts';
import { MalformedXmlError } from '../../domain/errors.ts';
import type { Part } from '../../domain/package.ts';
import {
  createProject,
  IDENTITY,
  type Instance,
  type ModelObject,
  type ModelPart,
  type Transform,
} from '../../domain/project/project.ts';
import { composeTransforms } from '../model/resolveProject.ts';
import { readModel } from '../model/readModel.ts';
import { MAX_XML_DEPTH } from '../opc/xml.ts';

/** 3mf.cpp:92-93. */
export const PRINT_CONFIG = 'Metadata/Slic3r_PE.config';
export const MODEL_CONFIG = 'Metadata/Slic3r_PE_model.config';

type Pairs = [key: string, value: string][];
export interface VolumeConfig {
  readonly first: number;
  readonly last: number;
  readonly metadata: Pairs;
}
export interface ObjectConfig {
  readonly metadata: Pairs;
  readonly volumes: VolumeConfig[];
}

/** Component nesting limit of `_create_object_instance` (3mf.cpp:2401). */
const MAX_RECURSIONS = 10;
// Rule 25: component fan-out multiplies instances, so one budget covers a read (the cap resolveProject uses).
const MAX_INSTANCES = 100_000;

const int = (value: string | undefined, what: string): number => {
  if (value === undefined || !/^\d{1,10}$/.test(value)) throw new Error(`${what} is not a non-negative integer`);
  return Number(value);
};

/**
 * Reads `Slic3r_PE_model.config` into per-object metadata and volumes by object id (3mf.cpp:2467-2575): `<object id>`
 * starts an object (a duplicate id fails), `<volume firstid lastid>` adds a volume to it, and `<metadata type key value>`
 * goes to the object (`type="object"`) or to its last volume (`type="volume"`, dropped when there is none); any other
 * type fails. Names are matched as written, prefix included, as expat does without namespace processing.
 * Throws `MalformedXmlError` naming `part`.
 */
export function readModelConfig(bytes: Uint8Array, part: string): Map<number, ObjectConfig> {
  const parser = new SaxesParser();
  const objects = new Map<number, ObjectConfig>();
  let current: ObjectConfig | undefined;
  let depth = 0;
  parser.on('closetag', () => depth--);
  parser.on('opentag', (tag) => {
    if (++depth > MAX_XML_DEPTH) throw new Error(`elements nested deeper than ${MAX_XML_DEPTH}`);
    const attr = (n: string): string | undefined => tag.attributes[n];
    if (tag.name === 'object') {
      const id = int(attr('id'), 'object id');
      if (objects.has(id)) throw new Error(`duplicate object id ${id}`);
      current = { metadata: [], volumes: [] };
      objects.set(id, current);
    } else if (tag.name === 'volume') {
      if (!current) throw new Error('a volume outside an object');
      current.volumes.push({
        first: int(attr('firstid'), 'firstid'),
        last: int(attr('lastid'), 'lastid'),
        metadata: [],
      });
    } else if (tag.name === 'metadata') {
      if (!current) throw new Error('metadata outside an object');
      const pair: [string, string] = [attr('key') ?? '', attr('value') ?? ''];
      const type = attr('type');
      if (type === 'object') current.metadata.push(pair);
      else if (type === 'volume') current.volumes.at(-1)?.metadata.push(pair);
      else throw new Error(`metadata of type "${type ?? ''}"`);
    }
  });
  try {
    parser.write(new TextDecoder().decode(bytes)).close();
  } catch (cause) {
    throw new MalformedXmlError(part, cause instanceof Error ? cause.message : String(cause), { cause });
  }
  return objects;
}

/** Last value of `key`, as PrusaSlicer's in-order assignment leaves it. */
const lastOf = (pairs: Pairs, key: string): string | undefined => pairs.findLast(([k]) => k === key)?.[1];

/** `true` when the closed mesh encloses negative volume (its_volume, TriangleMesh.cpp:1571-1592). */
function negative(v: Float32Array, t: Uint32Array): boolean {
  let sum = 0;
  for (let i = 0; i < t.length; i += 3) {
    const [a, b, c] = [t[i]! * 3, t[i + 1]! * 3, t[i + 2]! * 3];
    const [ax, ay, az] = [v[a]! - v[0]!, v[a + 1]! - v[1]!, v[a + 2]! - v[2]!];
    const [ux, uy, uz] = [v[b]! - v[a]!, v[b + 1]! - v[a + 1]!, v[b + 2]! - v[a + 2]!];
    const [wx, wy, wz] = [v[c]! - v[a]!, v[c + 1]! - v[a + 1]!, v[c + 2]! - v[a + 2]!];
    sum += ax * (uy * wz - uz * wy) + ay * (uz * wx - ux * wz) + az * (ux * wy - uy * wx);
  }
  return sum < 0;
}

const named = (pkg: { parts: readonly Part[] }, name: string): Part | undefined =>
  pkg.parts.find((p) => p.name.replace(/^\//, '').toLowerCase() === name.toLowerCase());

/**
 * The `prusa2` dialect reader. Each mesh object of the root model is one object; build items, and component-only
 * objects (how 2.x writes instances 2..n, 3mf.cpp:3169-3200), become its instances (3mf.cpp:2399-2444); objects no
 * item reaches are dropped (:1970-1979). With a `Slic3r_PE_model.config` entry, the object's name and config come from
 * its object metadata (:974-990) and its mesh splits into one part per volume triangle range (`_generate_volumes`,
 * :2576-2726): vertices rebased to the range, inside-out parts flipped, names defaulted from the object. Volume
 * metadata other than `name` (`volume_type`, `modifier`, `matrix`, `source_*` and settings) is the part config as
 * written; the part transform stays identity because 2.x writes vertices already in the object frame (:3298).
 * `Slic3r_PE.config` is returned raw in `rawConfig`; every other non-model part, the model config too, is preserved.
 * Throws `MalformedXmlError` on what PrusaSlicer refuses, and on overlapping volume ranges, which it accepts but never
 * writes; the dispatcher then falls back to the core read.
 * shortcut: production paths (`p:path`) throw, and the `unit` factor, the baking of single instances for files without
 * `slic3rpe:Version3mf` (:2642-2651) and the 2.4.0-alpha2 vertex compaction (:2633-2639) are not ported; PrusaSlicer
 * 2.x writes none of them. Revisit if third-party prusa2 files show up.
 */
export const readPrusa2: DialectReader = (pkg) => {
  const rootPart = named(pkg, pkg.rootModel);
  const root = readModel(rootPart?.bytes ?? new Uint8Array(), pkg.rootModel);
  const fail = (msg: string): never => {
    throw new MalformedXmlError(pkg.rootModel, msg);
  };
  const byId = new Map(root.objects.map((o) => [o.id, o]));

  const placed = new Map<number, Transform[]>();
  let instanceCount = 0;
  const place = (id: number, at: Transform, depth: number, path?: string): void => {
    if (path !== undefined) fail('production paths (p:path) are not read in a PrusaSlicer 2.x project');
    if (depth > MAX_RECURSIONS) fail(`components nest deeper than ${MAX_RECURSIONS}`);
    const obj = byId.get(id);
    if (obj?.type !== 'model') return fail(`object ${id} does not exist or is not of type model`);
    if (obj.mesh) {
      if (++instanceCount > MAX_INSTANCES) fail(`more than ${MAX_INSTANCES} instances`);
      const list = placed.get(id);
      if (list) list.push(at);
      else placed.set(id, [at]);
      return;
    }
    if (obj.components.length === 0) fail(`object ${id} has neither a mesh nor components`);
    for (const c of obj.components) place(c.objectId, composeTransforms(c.transform, at), depth + 1, c.path);
  };
  for (const item of root.build) place(item.objectId, item.transform, 1, item.path);

  const modelConfig = named(pkg, MODEL_CONFIG);
  const configs = modelConfig ? readModelConfig(modelConfig.bytes, modelConfig.name) : new Map<number, ObjectConfig>();
  const split = (obj: CoreObject, objectName: string, volumes: readonly VolumeConfig[]): ModelPart[] => {
    const mesh = obj.mesh!;
    const count = mesh.triangles.length / 3;
    // Rule 25: 2.x writes disjoint triangle and vertex blocks per volume (:3283-3296), so the copies never outgrow the
    // mesh; overlapping ranges, which would copy the mesh once per volume, are refused.
    let triangles = 0;
    let vertices = 0;
    let renamed = 0;
    return volumes.map((volume, i) => {
      const { first, last } = volume;
      if (first > last || last >= count)
        fail(`object ${obj.id} volume ${i}: triangles ${first}-${last} are outside 0-${count - 1}`);
      triangles += last - first + 1;
      if (triangles > count) fail(`object ${obj.id}: volume triangle ranges overlap`);
      const tris = mesh.triangles.slice(first * 3, (last + 1) * 3);
      let lo = tris[0]!;
      let hi = lo;
      for (const v of tris) {
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      vertices += hi - lo + 1;
      if (vertices > mesh.vertices.length / 3) fail(`object ${obj.id}: volume vertex ranges overlap`);
      for (let k = 0; k < tris.length; k++) tris[k]! -= lo;
      const verts = mesh.vertices.slice(lo * 3, (hi + 1) * 3);
      if (negative(verts, tris))
        for (let k = 0; k < tris.length; k += 3) [tris[k + 1], tris[k + 2]] = [tris[k + 2]!, tris[k + 1]!];
      let name = lastOf(volume.metadata, 'name') ?? '';
      if (name === '') name = renamed++ > 0 ? `${objectName}_${renamed}` : objectName;
      return {
        id: i,
        name,
        mesh: { vertices: verts, triangles: tris },
        transform: IDENTITY,
        config: new Map(volume.metadata.filter(([k]) => k !== 'name')),
      };
    });
  };

  const objects: ModelObject[] = [];
  const instances: Instance[] = [];
  for (const obj of root.objects) {
    const at = placed.get(obj.id);
    if (!at) continue;
    const config = configs.get(obj.id);
    const name = (config && lastOf(config.metadata, 'name')) ?? obj.name ?? `object ${obj.id}`;
    const count = obj.mesh!.triangles.length / 3;
    const volumes = config?.volumes ?? [{ first: 0, last: count - 1, metadata: [] }];
    objects.push({
      id: obj.id,
      name,
      parts: split(obj, name, volumes),
      config: new Map(config?.metadata.filter(([k]) => k !== 'name')),
    });
    for (const transform of at) instances.push({ objectId: obj.id, transform });
  }

  const printConfig = named(pkg, PRINT_CONFIG);
  return createProject({
    dialect: 'prusa2',
    objects,
    instances,
    rawConfig: new Map(printConfig ? [[printConfig.name, printConfig.bytes]] : []),
    preserved: pkg.parts.filter((p) => p !== printConfig && !p.name.toLowerCase().endsWith('.model')),
  });
};
