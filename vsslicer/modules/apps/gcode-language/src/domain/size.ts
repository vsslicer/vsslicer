// SPDX-License-Identifier: AGPL-3.0-or-later

/** Above this size language features stay off: scanning a file this large on every edit would stall the extension host. */
export const MAX_FEATURE_BYTES = 50 * 1024 * 1024;

export const featuresAvailable = (sizeBytes: number): boolean => sizeBytes <= MAX_FEATURE_BYTES;

export const OVERSIZE_REASON = 'the file is over 50 MB';

/** Above this many characters the unknown-command scan runs on open and save only, not after every edit (a 40 MB scan takes about 0.5 s). */
export const MAX_SCAN_ON_EDIT_CHARS = 4 * 1024 * 1024;

export const scansOnEdit = (chars: number): boolean => chars <= MAX_SCAN_ON_EDIT_CHARS;
