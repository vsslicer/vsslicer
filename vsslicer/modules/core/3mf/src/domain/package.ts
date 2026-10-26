// SPDX-License-Identifier: AGPL-3.0-or-later
/** One OPC relationship of a part (`_rels/<name>.rels`). */
export interface Relationship {
  readonly id: string;
  readonly type: string;
  /** Target as written: a part name, or a URI when `external`. */
  readonly target: string;
  readonly external: boolean;
}

/** One zip entry that is a part. `bytes` are the uncompressed content, untouched. */
export interface Part {
  /** Part name without the leading slash, e.g. `3D/3dmodel.model`. */
  readonly name: string;
  readonly contentType: string;
  readonly relationships: readonly Relationship[];
  readonly bytes: Uint8Array;
}

export interface Package {
  /** Name of the root model part, the target of the start-part relationship. */
  readonly rootModel: string;
  readonly parts: readonly Part[];
}
