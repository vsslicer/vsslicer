// SPDX-License-Identifier: AGPL-3.0-or-later

export type MeshErrorCode = 'truncated' | 'count-mismatch' | 'non-finite' | 'obj-index-out-of-range' | 'file-too-large';

/** Base of every mesh error. `message` is the user message: plain words, no stack or jargon. */
export abstract class MeshError extends Error {
  abstract readonly code: MeshErrorCode;
  override get name(): string {
    return this.constructor.name;
  }
}

/** The file ends before the data its header or structure promises. */
export class TruncatedMeshError extends MeshError {
  readonly code = 'truncated';
  readonly expectedBytes: number;
  readonly actualBytes: number;
  constructor(expectedBytes: number, actualBytes: number) {
    super(`The file is cut short: it should be at least ${expectedBytes} bytes but is ${actualBytes}.`);
    this.expectedBytes = expectedBytes;
    this.actualBytes = actualBytes;
  }
}

/** The triangle count the header declares does not match the file length. */
export class TriangleCountMismatchError extends MeshError {
  readonly code = 'count-mismatch';
  readonly declared: number;
  readonly actual: number;
  constructor(declared: number, actual: number) {
    super(`The file declares ${declared} triangles but holds ${actual}.`);
    this.declared = declared;
    this.actual = actual;
  }
}

/** A coordinate is NaN or infinite. `vertex` is the zero-based vertex number in file order. */
export class NonFiniteCoordinateError extends MeshError {
  readonly code = 'non-finite';
  readonly vertex: number;
  constructor(vertex: number) {
    super(`Vertex ${vertex + 1} has a coordinate that is not a finite number.`);
    this.vertex = vertex;
  }
}

/** An OBJ face names a vertex that does not exist. `index` is as written in the file (1-based or negative). */
export class ObjIndexOutOfRangeError extends MeshError {
  readonly code = 'obj-index-out-of-range';
  readonly line: number;
  readonly index: number;
  readonly vertexCount: number;
  constructor(line: number, index: number, vertexCount: number) {
    super(`Line ${line}: face uses vertex ${index} but the file has only ${vertexCount} vertices before it.`);
    this.line = line;
    this.index = index;
    this.vertexCount = vertexCount;
  }
}

/** The file is bigger than the cap. */
export class FileTooLargeError extends MeshError {
  readonly code = 'file-too-large';
  readonly bytes: number;
  readonly capBytes: number;
  constructor(bytes: number, capBytes: number) {
    super(`The file is ${bytes} bytes, above the ${capBytes} byte limit for models.`);
    this.bytes = bytes;
    this.capBytes = capBytes;
  }
}
