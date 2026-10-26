// SPDX-License-Identifier: AGPL-3.0-or-later
export interface Pin {
  name: string;
  repo: string;
  commit: string;
  sha256: string;
}
export interface GenerateOptions {
  repos?: string;
  outDir?: string;
  pins?: Pin[];
  head?: (clone: string) => string;
  maxBytes?: number;
  maxFiles?: number;
  maxTotal?: number;
}
export function readPins(root?: string): Pin[];
export function generate(options?: GenerateOptions): string[];
