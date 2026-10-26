// SPDX-License-Identifier: AGPL-3.0-or-later
import { SaxesParser } from 'saxes';
import type { BuildItem, Component, CoreModel, CoreObject } from '../../domain/coreModel.ts';
import { MalformedXmlError } from '../../domain/errors.ts';
import { IDENTITY, type Mesh, type Transform } from '../../domain/project/project.ts';

export const CORE_NS = 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02';
const MATERIAL_NS = 'http://schemas.microsoft.com/3dmanufacturing/material/2015/02';
const PRODUCTION_NS = 'http://schemas.microsoft.com/3dmanufacturing/production/2015/06';
const CHUNK_BYTES = 1 << 20;

class Fail extends Error {}

/** Growable typed array: no per-element objects, doubles when full. */
class Growable<T extends Float32Array | Uint32Array> {
  data: T;
  length = 0;
  private readonly make: (n: number) => T;
  constructor(make: (n: number) => T, capacity: number) {
    this.make = make;
    this.data = make(capacity);
  }
  push3(a: number, b: number, c: number): void {
    if (this.length + 3 > this.data.length) {
      const next = this.make(this.data.length * 2);
      next.set(this.data);
      this.data = next;
    }
    this.data[this.length++] = a;
    this.data[this.length++] = b;
    this.data[this.length++] = c;
  }
  trimmed(): T {
    return this.data.slice(0, this.length) as T;
  }
}

const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
const MAX_DEPTH = 64;
const UINT32_MAX = 2 ** 32 - 1;

function num(value: string | undefined, what: string): number {
  const n = value === undefined || !DECIMAL.test(value.trim()) ? NaN : Number(value);
  if (!Number.isFinite(n)) throw new Fail(`${what} is missing or not a number`);
  return n;
}

/** Strict decimal digits, at most `max`; property indices live in an Int32Array so they stop at 2^31-1. */
function index(value: string | undefined, what: string, max = 2 ** 31 - 1): number {
  if (value === undefined || !/^\d+$/.test(value.trim())) throw new Fail(`${what} is not a non-negative integer`);
  const n = Number(value);
  if (n > max) throw new Fail(`${what} is too large`);
  return n;
}

function parseTransform(value: string | undefined): Transform {
  if (value === undefined) return IDENTITY;
  const t = value
    .trim()
    .split(/\s+/)
    .map((v) => num(v, 'transform value'));
  if (t.length !== 12) throw new Fail('transform needs 12 numbers');
  return t as unknown as Transform;
}

/**
 * Streams a model part (core spec 2015/02 namespace) into objects, typed-array meshes, build items and metadata.
 * The bytes are decoded and fed to the SAX parser in 1 MiB chunks, so the XML text is never held whole.
 * Elements outside the core namespace are skipped. Any XML or structural error becomes `MalformedXmlError` naming `part`.
 * Base materials and colour groups (materials extension) land in `propertyGroups`, per-triangle pid/p1..p3 in `triangleProps`.
 * shortcut: slices and textures are ignored; add when a dialect reader needs them.
 */
export function readModel(bytes: Uint8Array, part: string): CoreModel {
  const parser = new SaxesParser({ xmlns: true });
  let unit = 'millimeter';
  const modelMeta = new Map<string, string>();
  const objects: CoreObject[] = [];
  const build: BuildItem[] = [];
  const propertyGroups = new Map<number, (string | undefined)[]>();
  let group: (string | undefined)[] | undefined;
  let sawRoot = false;
  let depth = 0;
  /** Depth of the foreign element being skipped, 0 when none. */
  let skipFrom = 0;
  let obj:
    | {
        fields: Omit<CoreObject, 'mesh' | 'triangleProps' | 'components' | 'metadata'>;
        components: Component[];
        meta: Map<string, string>;
        mesh?: Mesh;
        triangleProps?: Int32Array;
        props?: number[];
      }
    | undefined;
  let verts: Growable<Float32Array> | undefined;
  let tris: Growable<Uint32Array> | undefined;
  let metaName: string | undefined;
  let metaText = '';
  const ids = new Set<number>();

  parser.on('opentag', (tag) => {
    depth++;
    if (depth > MAX_DEPTH) throw new Fail(`elements nested deeper than ${MAX_DEPTH}`);
    if (depth === 1) {
      if (tag.local !== 'model' || tag.uri !== CORE_NS) throw new Fail('the root element is not a 3MF core <model>');
      sawRoot = true;
      unit = tag.attributes.unit?.value ?? unit;
      return;
    }
    if (skipFrom !== 0 || (tag.uri !== CORE_NS && tag.uri !== MATERIAL_NS)) {
      if (skipFrom === 0) skipFrom = depth;
      return;
    }
    const attr = (n: string): string | undefined => tag.attributes[n]?.value;
    const pathOf = (): string | undefined => {
      for (const a of Object.values(tag.attributes)) if (a.uri === PRODUCTION_NS && a.local === 'path') return a.value;
      return undefined;
    };
    switch (tag.local) {
      case 'metadata':
        metaName = attr('name');
        metaText = '';
        break;
      case 'object': {
        const id = index(attr('id'), 'object id');
        if (ids.has(id)) throw new Fail(`duplicate object id ${id}`);
        ids.add(id);
        const name = attr('name');
        const partNumber = attr('partnumber');
        const pid = attr('pid') === undefined ? undefined : index(attr('pid'), 'object pid');
        const pindex = attr('pindex') === undefined ? undefined : index(attr('pindex'), 'object pindex');
        obj = {
          fields: {
            id,
            type: attr('type') ?? 'model',
            ...(pid !== undefined && { pid }),
            ...(pindex !== undefined && { pindex }),
            ...(name !== undefined && { name }),
            ...(partNumber !== undefined && { partNumber }),
          },
          components: [],
          meta: new Map(),
        };
        break;
      }
      case 'mesh':
        if (verts || obj?.mesh) throw new Fail('an object has more than one <mesh>');
        verts = new Growable((n) => new Float32Array(n), 3 * 1024);
        tris = new Growable((n) => new Uint32Array(n), 3 * 1024);
        break;
      case 'vertex':
        verts?.push3(num(attr('x'), 'vertex x'), num(attr('y'), 'vertex y'), num(attr('z'), 'vertex z'));
        break;
      case 'triangle': {
        if (tris && obj) {
          const opt = (n: string): number => (attr(n) === undefined ? -1 : index(attr(n), `triangle ${n}`));
          if (obj.props === undefined && attr('pid') !== undefined)
            obj.props = new Array<number>((tris.length / 3) * 4).fill(-1);
          obj.props?.push(opt('pid'), opt('p1'), opt('p2'), opt('p3'));
        }
        tris?.push3(
          index(attr('v1'), 'triangle v1', UINT32_MAX),
          index(attr('v2'), 'triangle v2', UINT32_MAX),
          index(attr('v3'), 'triangle v3', UINT32_MAX),
        );
        break;
      }
      case 'basematerials':
      case 'colorgroup':
        group = [];
        propertyGroups.set(index(attr('id'), `${tag.local} id`), group);
        break;
      case 'base':
      case 'color':
        group?.push(attr(tag.local === 'base' ? 'displaycolor' : 'color'));
        break;
      case 'component': {
        const path = pathOf();
        obj?.components.push({
          objectId: index(attr('objectid'), 'component objectid'),
          ...(path !== undefined && { path }),
          transform: parseTransform(attr('transform')),
        });
        break;
      }
      case 'item': {
        const path = pathOf();
        const partNumber = attr('partnumber');
        build.push({
          objectId: index(attr('objectid'), 'item objectid'),
          ...(path !== undefined && { path }),
          transform: parseTransform(attr('transform')),
          ...(partNumber !== undefined && { partNumber }),
        });
        break;
      }
    }
  });
  parser.on('text', (text) => {
    if (metaName !== undefined) metaText += text;
  });
  parser.on('closetag', (tag) => {
    if (skipFrom !== 0) {
      if (depth === skipFrom) skipFrom = 0;
      depth--;
      return;
    }
    depth--;
    if (tag.local === 'basematerials' || tag.local === 'colorgroup') group = undefined;
    if (tag.local === 'metadata' && metaName !== undefined) {
      (obj?.meta ?? modelMeta).set(metaName, metaText.trim());
      metaName = undefined;
    } else if (tag.local === 'mesh' && verts && tris && obj) {
      const vertices = verts.trimmed();
      const triangles = tris.trimmed();
      const count = vertices.length / 3;
      for (const i of triangles) if (i >= count) throw new Fail(`triangle index ${i} out of range (${count} vertices)`);
      obj.mesh = { vertices, triangles };
      if (obj.props) obj.triangleProps = Int32Array.from(obj.props);
      verts = tris = undefined;
    } else if (tag.local === 'object' && obj) {
      objects.push({
        ...obj.fields,
        ...(obj.mesh && { mesh: obj.mesh }),
        ...(obj.triangleProps && { triangleProps: obj.triangleProps }),
        components: obj.components,
        metadata: obj.meta,
      });
      obj = undefined;
    }
  });

  try {
    const decoder = new TextDecoder();
    for (let at = 0; at < bytes.length; at += CHUNK_BYTES) {
      parser.write(decoder.decode(bytes.subarray(at, at + CHUNK_BYTES), { stream: true }));
    }
    parser.write(decoder.decode()).close();
    if (!sawRoot) throw new Fail('the part is empty');
  } catch (cause) {
    throw new MalformedXmlError(part, cause instanceof Error ? cause.message : String(cause), { cause });
  }
  return { unit, metadata: modelMeta, objects, build, propertyGroups };
}
