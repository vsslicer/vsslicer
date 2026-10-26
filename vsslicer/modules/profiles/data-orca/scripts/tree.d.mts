// SPDX-License-Identifier: AGPL-3.0-or-later
export const MAX_FILE_BYTES: number;
export function listJson(root: string, maxBytes?: number): string[];
export function hashFiles(root: string, paths: string[]): string;
