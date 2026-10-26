// SPDX-License-Identifier: AGPL-3.0-or-later

/** Calls that move data to the GPU; a redraw after the first upload must issue none of them. */
export const UPLOAD_CALLS = [
  'texImage2D',
  'texSubImage2D',
  'texImage3D',
  'texSubImage3D',
  'bufferData',
  'bufferSubData',
] as const;

export interface GlSpy<T extends object> {
  /** The context to hand to the code under test; forwards every call to `gl`. */
  gl: T;
  /** Number of upload calls since creation or the last `reset`, by name. */
  uploads: Record<string, number>;
  /** Bytes of immutable texture storage (`texStorage2D`) allocated since creation or `reset`. */
  storageBytes(): number;
  reset(): void;
}

// Bytes per texel of the sized formats the kit allocates.
const TEXEL_BYTES: Record<string, number> = { R8: 1, RG8: 2, RGBA8: 4, R32UI: 4, RG32UI: 8, RGBA32UI: 16, RGBA32F: 16 };

/** Wraps a WebGL2 context (structurally typed, no DOM lib needed) to count upload calls and texture storage. */
export function spyGlUploads<T extends object>(gl: T): GlSpy<T> {
  const uploads: Record<string, number> = {};
  let bytes = 0;
  const bytesPerTexel = (format: unknown) =>
    Object.entries(TEXEL_BYTES).find(([name]) => (gl as Record<string, unknown>)[name] === format)?.[1] ?? 0;
  const proxy = new Proxy(gl, {
    get(target, prop) {
      const v = Reflect.get(target, prop, target) as unknown;
      if (typeof v !== 'function') return v;
      return (...args: unknown[]) => {
        if ((UPLOAD_CALLS as readonly (string | symbol)[]).includes(prop)) {
          uploads[prop as string] = (uploads[prop as string] ?? 0) + 1;
        } else if (prop === 'texStorage2D') {
          bytes += bytesPerTexel(args[2]) * (args[3] as number) * (args[4] as number);
        }
        return (v as (...a: unknown[]) => unknown).apply(target, args);
      };
    },
  });
  return {
    gl: proxy,
    uploads,
    storageBytes: () => bytes,
    reset() {
      for (const k of Object.keys(uploads)) delete uploads[k];
      bytes = 0;
    },
  };
}
