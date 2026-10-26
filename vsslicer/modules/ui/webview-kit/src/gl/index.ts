// SPDX-License-Identifier: AGPL-3.0-or-later
export { TRANSPORT_SCHEMA_VERSION } from '../domain/schema.ts';
export { createGl2Context, GlContextError, showGlFailure } from './context.ts';
export type { GlFailureCause, GlResult } from './context.ts';
export { MOVE_TEXTURE_GLSL, MOVE_WORDS, planMoveChunks, uploadMoveTextures } from './move-textures.ts';
export type { MoveTextureChunk } from './move-textures.ts';
export { trackContextLoss } from './context-loss.ts';
export { saveGlState } from './gl-state.ts';
export type { GpuBuild, GpuResources } from './context-loss.ts';
export { ColorMode, createSegmentRenderer } from './segment-renderer.ts';
export type { SegmentRenderer, SegmentView } from './segment-renderer.ts';
