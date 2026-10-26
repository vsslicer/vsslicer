// SPDX-License-Identifier: AGPL-3.0-or-later
// Does the file open here match the one the printer prints? Size first (cheap), then MD5 when the printer gave one.
import { createHash } from 'node:crypto';

/** What the printer says about the file it prints; at least one field. */
export interface FileCheck {
  size?: number;
  /** 32 hex digits. */
  md5?: string;
}

/** Hashing reads the whole file; above this the check refuses rather than read without bound. */
export const MAX_MD5_BYTES = 256 * 1024 * 1024;

/** Validates an untrusted file description (a command argument). */
export const parseFileCheck = (x: unknown): FileCheck => {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) throw new TypeError('file must be an object');
  const unknown = Object.keys(x).find((k) => k !== 'size' && k !== 'md5');
  if (unknown !== undefined) throw new TypeError(`file has an unknown field: ${unknown.slice(0, 64)}`);
  const { size, md5 } = x as FileCheck;
  if (size !== undefined && !(Number.isSafeInteger(size) && size >= 0))
    throw new TypeError('size must be a non-negative integer');
  if (md5 !== undefined && !(typeof md5 === 'string' && /^[0-9a-f]{32}$/i.test(md5)))
    throw new TypeError('md5 must be 32 hex digits');
  if (size === undefined && md5 === undefined) throw new TypeError('file needs size or md5');
  return { size, md5 } as FileCheck;
};

/** A message when the local file differs from `expect` (or cannot be checked), else undefined. */
export const fileMismatch = async (
  expect: FileCheck,
  local: { size: number; read(): Promise<Uint8Array> },
): Promise<string | undefined> => {
  if (expect.size !== undefined && local.size !== expect.size)
    return `the file here is ${local.size} bytes but the printer's is ${expect.size}`;
  if (expect.md5 === undefined) return undefined;
  if (local.size > MAX_MD5_BYTES)
    return `the file here is too large to check against the printer's MD5 (${local.size} bytes)`;
  const md5 = createHash('md5')
    .update(await local.read())
    .digest('hex');
  return md5 === expect.md5.toLowerCase()
    ? undefined
    : `the file here has MD5 ${md5} but the printer's is ${expect.md5.toLowerCase()}`;
};
