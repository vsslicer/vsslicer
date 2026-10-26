// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Mesh, Transform } from './project/project.ts';

/** A reference from an object to another object, possibly in another part (`path`, Production extension). */
export interface Component {
  readonly objectId: number;
  readonly path?: string;
  readonly transform: Transform;
}

/** An `<object>` of the core spec as written: a mesh, or components, or both (invalid but kept). */
export interface CoreObject {
  readonly id: number;
  readonly type: string;
  readonly name?: string;
  readonly partNumber?: string;
  readonly mesh?: Mesh;
  /** Default property group and index of the object's triangles (`pid`, `pindex`). */
  readonly pid?: number;
  readonly pindex?: number;
  /** Per triangle `pid, p1, p2, p3`, -1 where absent. Only when some triangle sets `pid`. */
  readonly triangleProps?: Int32Array;
  readonly components: readonly Component[];
  readonly metadata: ReadonlyMap<string, string>;
}

export interface BuildItem {
  readonly objectId: number;
  readonly path?: string;
  readonly transform: Transform;
  readonly partNumber?: string;
}

/** What one model part says, before a dialect reader maps it to a `Project`. */
export interface CoreModel {
  readonly unit: string;
  readonly metadata: ReadonlyMap<string, string>;
  readonly objects: readonly CoreObject[];
  readonly build: readonly BuildItem[];
  /** Base-material and colour groups by resource id: one `#RRGGBB[AA]` (undefined when absent) per entry. */
  readonly propertyGroups: ReadonlyMap<number, readonly (string | undefined)[]>;
}
