// SPDX-License-Identifier: AGPL-3.0-or-later

/** Every failure an adapter reports. The strings are stable: consumers switch on them. */
export const PRINTER_ERROR_KINDS = [
  'auth',
  'unreachable',
  'timeout',
  'refused',
  'busy',
  'unsupported',
  'protocol',
  'fileRejected',
] as const;

export type PrinterErrorKind = (typeof PRINTER_ERROR_KINDS)[number];

/** A typed printer failure with the underlying cause kept for diagnostics. */
export class PrinterError extends Error {
  readonly kind: PrinterErrorKind;

  constructor(kind: PrinterErrorKind, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'PrinterError';
    this.kind = kind;
  }
}

export function isPrinterError(value: unknown, kind?: PrinterErrorKind): value is PrinterError {
  return value instanceof PrinterError && (kind === undefined || value.kind === kind);
}
