// SPDX-License-Identifier: AGPL-3.0-or-later

/** Builds GPU objects from CPU data; may return a function that frees them. */
export type GpuBuild = () => void | (() => void);

export interface GpuResources {
  /**
   * Runs `build` now and again after every `webglcontextrestored`, so a renderer registers each
   * group of GPU objects once and never handles the loss itself. `build` closes over the CPU-side
   * data it uploads; that data stays referenced only until the returned function (or `dispose`)
   * drops the entry. The objects of a lost context are gone, so `build` is not told to free them.
   */
  add(build: GpuBuild): () => void;
  /** Stops listening, frees the latest build of every entry and drops it (and with them the CPU data they close over). */
  dispose(): void;
}

/**
 * Keeps GPU resources alive across WebGL context loss. Cancels `webglcontextlost` (without that
 * the browser never restores) and rebuilds the registered resources, in registration order, on
 * restore, then calls `onRestored` so the renderer can redraw. A throwing rebuild does not stop the
 * others; the first error is passed to `onRestored` so the renderer can show its failure UI. Nothing goes through the host:
 * the CPU arrays are already in the webview.
 */
export function trackContextLoss(
  canvas: HTMLCanvasElement,
  hooks: { onLost?: () => void; onRestored?: (error?: unknown) => void } = {},
): GpuResources {
  const entries = new Map<object, { build: GpuBuild; free: void | (() => void) }>();
  const lost = (e: Event) => {
    e.preventDefault();
    hooks.onLost?.();
  };
  const restored = () => {
    // Iterate a snapshot: entries added or removed meanwhile are not rebuilt by this pass.
    // The lost context's objects are gone, so the old `free` is dropped; keep the rebuild's.
    let error: unknown;
    let failed = false;
    for (const e of [...entries.values()]) {
      try {
        e.free = e.build();
      } catch (err) {
        e.free = undefined; // the lost context's free must not run on a context that never rebuilt it
        if (!failed) [failed, error] = [true, err];
      }
    }
    hooks.onRestored?.(...(failed ? [error] : []));
  };
  canvas.addEventListener('webglcontextlost', lost);
  canvas.addEventListener('webglcontextrestored', restored);
  return {
    add(build) {
      const key = {};
      const entry = { build, free: build() };
      entries.set(key, entry);
      return () => {
        if (!entries.delete(key)) return;
        entry.free?.();
      };
    },
    dispose() {
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', restored);
      for (const e of entries.values()) e.free?.();
      entries.clear();
    },
  };
}
