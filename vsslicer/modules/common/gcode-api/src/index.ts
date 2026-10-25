// SPDX-License-Identifier: AGPL-3.0-or-later
export { MOVE_STRIDE, MoveFlag, MoveOffset, MoveRole, readMove, writeMove } from './domain/move-buffer.ts';
export type { Move } from './domain/move-buffer.ts';
export type {
  Chunk,
  Diagnostic,
  Layer,
  Marker,
  MoveRange,
  ObjectLabel,
  Parse,
  ParsedFile,
  ParseOptions,
  Slicer,
  Thumbnail,
  ThumbnailFormat,
} from './domain/parsed-file.ts';
export {
  STATE_CHANGE_STRIDE,
  StateChangeOffset,
  StateKind,
  readStateChange,
  writeStateChange,
} from './domain/state-change.ts';
export type { StateChange } from './domain/state-change.ts';
