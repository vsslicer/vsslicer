// SPDX-License-Identifier: AGPL-3.0-or-later
export { nativeKeys, nativeToUnified, unifiedToNative } from './convert-key.ts';
export type { NativeRecord, NativeResult, ToNativeOptions } from './convert-key.ts';
export { MAPPED_KEYS, RULES } from './rules.ts';
export type { MappedDialect, Rule } from './rules.ts';
export { MappingError, MAX_LIST, MAX_POINTS, MAX_SCALAR, MAX_TEXT } from './values.ts';
export type { MappingErrorCode, Raw } from './values.ts';
