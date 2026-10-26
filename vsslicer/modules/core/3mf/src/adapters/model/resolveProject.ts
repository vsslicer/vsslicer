// SPDX-License-Identifier: AGPL-3.0-or-later
import type { CoreModel, CoreObject } from '../../domain/coreModel.ts';
import { MalformedXmlError, MissingProductionPartError } from '../../domain/errors.ts';
import type { Package } from '../../domain/package.ts';
import {
  createProject,
  IDENTITY,
  type Instance,
  type Material,
  type ModelObject,
  type ModelPart,
  type Project,
  type Transform,
} from '../../domain/project/project.ts';
import { readModelOnce } from './readModelOnce.ts';

/** `a` applied first, then `b`, in 3MF's row-vector convention (p' = p * A * B). */
export function composeTransforms(a: Transform, b: Transform): Transform {
  const out: number[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      // Row 3 is the translation: its implicit fourth column is 1, so B's translation adds in.
      out.push((r < 3 ? 0 : b[9 + c]!) + [0, 1, 2].reduce((s, k) => s + (a[r * 3 + k] ?? 0) * b[k * 3 + c]!, 0));
    }
  }
  return out as unknown as Transform;
}

const MAX_DEPTH = 64;
// Rule 25: component fan-out is a billion-laughs vector, so one budget covers a whole resolveProject call.
const MAX_PARTS = 100_000;
const MAX_TRIANGLES = 10_000_000;

/**
 * Resolves a root `CoreModel` into a `Project` (dialect `core`): every build item becomes an `Instance`, the
 * objects it names become `ModelObject`s whose parts are the leaf meshes with their component transforms composed
 * (relative to the object's own frame; the item transform stays on the instance).
 * `load` returns the model of a production part (`p:path`), e.g. `/3D/Objects/o.model`; without it such references fail.
 * A mesh whose triangles carry different colours is split into one part per colour, taken from p1 of each triangle.
 * A production part `load` does not return throws `MissingProductionPartError`; component cycles, missing objects
 * and bad property indices throw `MalformedXmlError` naming `part`.
 * shortcut: a triangle's p2/p3 (colour gradients) are ignored, and objects without items are not listed.
 */
export function resolveProject(
  root: CoreModel,
  part = '3D/3dmodel.model',
  load: (path: string) => CoreModel | undefined = () => undefined,
): Project {
  const fail = (msg: string): never => {
    throw new MalformedXmlError(part, msg);
  };
  const throwMissing = (path: string): never => {
    throw new MissingProductionPartError(path);
  };
  const modelAt = (path: string | undefined): CoreModel =>
    path === undefined ? root : (load(path) ?? throwMissing(path));
  const objectIn = (model: CoreModel, id: number, path?: string): CoreObject =>
    model.objects.find((o) => o.id === id) ?? fail(`object ${id}${path ? ` in ${path}` : ''} does not exist`);

  const colorOf = (model: CoreModel, pid: number | undefined, p: number | undefined): string | undefined => {
    if (pid === undefined || pid < 0 || p === undefined || p < 0) return undefined;
    const group = model.propertyGroups.get(pid) ?? fail(`property group ${pid} does not exist`);
    if (p >= group.length) fail(`property index ${p} is outside group ${pid}`);
    return group[p];
  };

  let visits = 0;
  let leaves = 0;
  let leafTris = 0;
  const spend = (): void => {
    if (visits > MAX_PARTS || leaves > MAX_PARTS || leafTris > MAX_TRIANGLES)
      fail(`components expand to more than ${MAX_PARTS} parts or ${MAX_TRIANGLES} triangles`);
  };

  /** Leaf parts of `obj` (in part `file`, '' for the root) and everything below it, transforms relative to `obj`. */
  const flatten = (
    model: CoreModel,
    file: string,
    obj: CoreObject,
    at: Transform,
    trail: string[],
    out: ModelPart[],
  ): void => {
    // Production ids are per part, so the trail keys on (part, id).
    const key = `${file}|${obj.id}`;
    if (trail.includes(key) || trail.length > MAX_DEPTH)
      fail(`component cycle or nesting too deep at object ${obj.id}`);
    visits++;
    spend();
    const base = obj.name ?? `object ${obj.id}`;
    const add = (name: string, mesh: NonNullable<CoreObject['mesh']>, color?: string): void => {
      leaves++;
      spend();
      out.push({
        id: out.length,
        name,
        mesh,
        transform: at,
        ...(color !== undefined && { material: { color } satisfies Material }),
        config: new Map(),
      });
    };
    const mesh = obj.mesh;
    if (mesh) {
      leafTris += mesh.triangles.length / 3;
      spend();
      const tp = obj.triangleProps;
      if (!tp) add(base, mesh, colorOf(model, obj.pid, obj.pindex));
      else {
        const byColor = new Map<string, number[]>();
        for (let t = 0; t < mesh.triangles.length / 3; t++) {
          const pid = tp[t * 4]! >= 0 ? tp[t * 4] : obj.pid;
          const p1 = tp[t * 4 + 1]! >= 0 ? tp[t * 4 + 1] : tp[t * 4]! >= 0 ? undefined : obj.pindex;
          const color = colorOf(model, pid, p1) ?? '';
          const list = byColor.get(color) ?? [];
          list.push(mesh.triangles[t * 3]!, mesh.triangles[t * 3 + 1]!, mesh.triangles[t * 3 + 2]!);
          byColor.set(color, list);
        }
        for (const [color, list] of byColor) {
          const sub = { vertices: mesh.vertices, triangles: Uint32Array.from(list) };
          add(byColor.size > 1 && color ? `${base} ${color}` : base, sub, color || undefined);
        }
      }
    }
    for (const c of obj.components) {
      const m = c.path === undefined ? model : modelAt(c.path);
      const f = c.path ?? file;
      flatten(m, f, objectIn(m, c.objectId, c.path), composeTransforms(c.transform, at), [...trail, key], out);
    }
  };

  const objects = new Map<string, ModelObject>();
  const instances: Instance[] = [];
  const usedIds = new Set<number>();
  for (const item of root.build) {
    const k = `${item.path ?? ''}|${item.objectId}`;
    if (!objects.has(k)) {
      const model = modelAt(item.path);
      const obj = objectIn(model, item.objectId, item.path);
      // Ids must be unique in a project: an object from another part that clashes gets the next free id.
      let id = item.objectId;
      while (usedIds.has(id)) id++;
      usedIds.add(id);
      const parts: ModelPart[] = [];
      flatten(model, item.path ?? '', obj, IDENTITY, [], parts);
      objects.set(k, { id, name: obj.name ?? `object ${item.objectId}`, parts, config: new Map() });
    }
    instances.push({ objectId: objects.get(k)!.id, transform: item.transform });
  }
  return createProject({ dialect: 'core', objects: [...objects.values()], instances });
}

/** Reads a package's root model and every production part it reaches (each read once) into a `Project`. */
export function readProject(pkg: Package): Project {
  const bytesOf = new Map(pkg.parts.map((p) => [p.name, p.bytes]));
  const models = new Map<string, CoreModel | undefined>();
  const read = (name: string): CoreModel | undefined => {
    if (!models.has(name)) {
      const bytes = bytesOf.get(name);
      models.set(name, bytes && readModelOnce(bytes, name));
    }
    return models.get(name);
  };
  const root = read(pkg.rootModel) ?? readModelOnce(new Uint8Array(), pkg.rootModel);
  return resolveProject(root, pkg.rootModel, (path) => read(path.replace(/^\//, '')));
}
