// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Pin } from './generate.mjs';
export const URLS: Record<string, string>;
export const defaultCache: string;
export function fetchPinned(pin: Pin, cache?: string, url?: string): string;
