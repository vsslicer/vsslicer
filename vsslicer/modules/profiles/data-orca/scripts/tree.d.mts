// SPDX-License-Identifier: AGPL-3.0-or-later
export const MAX_FILE_BYTES: number;
export const MAX_FILES: number;
export const MAX_TOTAL_BYTES: number;
export function listJson(root: string, maxBytes?: number, maxFiles?: number, maxTotal?: number): string[];
export function hashFiles(root: string, paths: string[]): string;
