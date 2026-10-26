// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Part } from '../package.ts';

export type Dialect = 'core' | 'prusa2' | 'prusa3' | 'bambu' | 'orca' | 'cura';

/** 4x3 affine transform, row-major as 3MF writes it: 12 numbers m00 m01 m02 m10 .. m22 tx ty tz. */
export type Transform = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export const IDENTITY: Transform = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];

export interface Mesh {
  /** x,y,z triplets. */
  readonly vertices: Float32Array;
  /** Vertex-index triplets. */
  readonly triangles: Uint32Array;
}

/** Throws RangeError when the arrays are not triplets or a triangle indexes a missing vertex. */
export function createMesh(vertices: Float32Array, triangles: Uint32Array): Mesh {
  if (vertices.length % 3 !== 0) throw new RangeError('vertices length is not a multiple of 3');
  if (triangles.length % 3 !== 0) throw new RangeError('triangles length is not a multiple of 3');
  const count = vertices.length / 3;
  for (const index of triangles) {
    if (index >= count) throw new RangeError(`triangle index ${index} out of range (${count} vertices)`);
  }
  return { vertices, triangles };
}

/** Display colour or material slot of a part. */
export interface Material {
  /** `#RRGGBB` or `#RRGGBBAA`. */
  readonly color?: string;
  /** 1-based extruder / filament slot. */
  readonly extruder?: number;
}

/** One volume of an object: a mesh with its own placement inside the object. */
export interface ModelPart {
  readonly id: number;
  readonly name: string;
  readonly mesh: Mesh;
  readonly transform: Transform;
  readonly material?: Material;
  /** Volume kind as the dialect wrote it (Bambu/Orca `subtype`: normal_part, modifier_part, negative_part, ...). */
  readonly subtype?: string;
  /** Raw per-triangle attributes of `mesh` (painting and the like) by name, '' where unset. Absent when none. */
  readonly triangleAttributes?: ReadonlyMap<string, readonly string[]>;
  /** Per-part settings, key to value as the dialect wrote them. */
  readonly config: ReadonlyMap<string, string>;
}

export interface ModelObject {
  readonly id: number;
  readonly name: string;
  readonly parts: readonly ModelPart[];
  /** Per-object settings, key to value as the dialect wrote them. */
  readonly config: ReadonlyMap<string, string>;
}

/** One placement of an object (a 3MF build item). */
export interface Instance {
  readonly objectId: number;
  readonly transform: Transform;
  /** Plate the instance sits on; absent in dialects without plates. */
  readonly plateId?: number;
}

export interface Plate {
  readonly id: number;
  readonly name?: string;
  readonly config: ReadonlyMap<string, string>;
}

/** One custom G-code at a print height (colour change, pause, template, ...). Unknown XML attributes stay in `attributes`. */
export interface CustomGcode {
  readonly printZ: number;
  /** Upstream `CustomGCode::Type` as written: 0 colour change, 1 pause, 2 tool change, 3 template, 4 custom. */
  readonly type: number;
  readonly extruder: number;
  readonly color: string;
  readonly extra: string;
  readonly attributes: ReadonlyMap<string, string>;
}

export interface PlateCustomGcodes {
  readonly plateId: number;
  /** `SingleExtruder`, `MultiAsSingle` or `MultiExtruder` as written; absent when the file has no mode. */
  readonly mode?: string;
  readonly items: readonly CustomGcode[];
}

/** Per-object settings over a z range (`layer_config_ranges.xml`), option key to value as written. */
export interface LayerRange {
  readonly objectId: number;
  readonly minZ: number;
  readonly maxZ: number;
  readonly options: ReadonlyMap<string, string>;
}

/** Variable layer height profile of an object: z, height pairs flattened (`layer_heights_profile.txt`). */
export interface LayerHeightProfile {
  readonly objectId: number;
  readonly profile: readonly number[];
}

export interface CutConnector {
  readonly volumeId: number;
  readonly type: number;
  readonly rTolerance: number;
  readonly hTolerance: number;
  readonly attributes: ReadonlyMap<string, string>;
}

/** Cut information of an object (`cut_information.xml`). */
export interface CutInfo {
  readonly objectId: number;
  readonly cutId?: { readonly id: number; readonly checkSum: number; readonly connectorsCount: number };
  readonly connectors: readonly CutConnector[];
}

export interface Project {
  readonly dialect: Dialect;
  readonly plates: readonly Plate[];
  readonly customGcodes: readonly PlateCustomGcodes[];
  readonly layerRanges: readonly LayerRange[];
  readonly layerHeightProfiles: readonly LayerHeightProfile[];
  readonly cuts: readonly CutInfo[];
  readonly objects: readonly ModelObject[];
  readonly instances: readonly Instance[];
  /** Raw project config exactly as stored (text or JSON), by part name. Empty when absent. */
  readonly rawConfig: ReadonlyMap<string, Uint8Array>;
  /** Printable area (bed shape) as x,y polygon vertices in mm, from the project config. Absent when not stored. */
  readonly printableArea?: readonly (readonly [x: number, y: number])[];
  /** Parts the model does not interpret, kept byte for byte so a save can write them back. */
  readonly preserved: readonly Part[];
  /** User-facing notes about the read, e.g. that a dialect reader was skipped. Absent when there are none. */
  readonly notices?: readonly string[];
}

export function createProject(init: Partial<Project> & Pick<Project, 'dialect'>): Project {
  const objects = init.objects ?? [];
  const ids = new Set<number>();
  for (const o of objects) {
    if (ids.has(o.id)) throw new RangeError(`duplicate object id ${o.id}`);
    ids.add(o.id);
  }
  const instances = init.instances ?? [];
  for (const i of instances) {
    if (!ids.has(i.objectId)) throw new RangeError(`instance references unknown object ${i.objectId}`);
  }
  return {
    plates: [],
    customGcodes: [],
    layerRanges: [],
    layerHeightProfiles: [],
    cuts: [],
    rawConfig: new Map(),
    preserved: [],
    ...init,
    objects,
    instances,
  };
}
