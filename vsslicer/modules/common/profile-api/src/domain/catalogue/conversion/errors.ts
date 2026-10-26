// SPDX-License-Identifier: AGPL-3.0-or-later
export type ConversionErrorCode =
  'not_a_number' | 'zero_factor' | 'unmapped_enum_value' | 'percent_base_missing' | 'split_mismatch';

/** A value that cannot be converted; never a guess. */
export class ConversionError extends Error {
  readonly code: ConversionErrorCode;
  constructor(code: ConversionErrorCode, message: string) {
    super(message);
    this.name = 'ConversionError';
    this.code = code;
  }
}
