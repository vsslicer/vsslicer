// SPDX-License-Identifier: AGPL-3.0-or-later

const table = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  return c >>> 0;
});

/** Standard CRC-32 (IEEE, reflected); pass the previous result as `crc` to continue over more bytes. */
export function crc32(data: Uint8Array, crc = 0): number {
  let c = ~crc;
  for (const b of data) c = table[(c ^ b) & 0xff]! ^ (c >>> 8);
  return ~c >>> 0;
}
