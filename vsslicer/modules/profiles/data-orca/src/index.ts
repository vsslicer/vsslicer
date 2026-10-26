// SPDX-License-Identifier: AGPL-3.0-or-later
import { fileURLToPath } from 'node:url';

/** Absolute directory holding `orca/` and `bambu/` profile trees (`<vendor>.json` manifests and `<vendor>/**`). */
export const dataRoot: string = fileURLToPath(new URL('../data/', import.meta.url));
