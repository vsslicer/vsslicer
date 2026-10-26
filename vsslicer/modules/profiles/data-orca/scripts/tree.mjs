// SPDX-License-Identifier: AGPL-3.0-or-later
// Walks and hashes profile JSON trees. Reads files as bytes only; nothing is executed.
import { createHash } from 'node:crypto';
import { lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, sep } from 'node:path';

export const MAX_FILE_BYTES = 16 * 1024 * 1024;
export const MAX_FILES = 50_000;
export const MAX_TOTAL_BYTES = 256 * 1024 * 1024;

/**
 * Relative POSIX paths of every `.json` file under `root`, sorted. Other file types are skipped.
 * Throws on a symlink, a path that leaves `root`, or a `.json` file over `maxBytes` (rule 25).
 */
export function listJson(root, maxBytes = MAX_FILE_BYTES, maxFiles = MAX_FILES, maxTotal = MAX_TOTAL_BYTES) {
  let total = 0;
  const real = realpathSync(root);
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const st = lstatSync(full);
      if (st.isSymbolicLink()) throw new Error(`refusing symlink: ${full}`);
      const r = realpathSync(full);
      if (r !== real && !r.startsWith(real + sep)) throw new Error(`path leaves the root: ${full}`);
      if (st.isDirectory()) walk(full);
      else if (st.isFile() && name.endsWith('.json')) {
        if (st.size > maxBytes) throw new Error(`file over ${maxBytes} bytes: ${full}`);
        total += st.size;
        if (out.length >= maxFiles) throw new Error(`more than ${maxFiles} files under ${root}`);
        if (total > maxTotal) throw new Error(`total over ${maxTotal} bytes under ${root}`);
        out.push(
          full
            .slice(root.length + 1)
            .split(sep)
            .join('/'),
        );
      }
    }
  };
  walk(root);
  return out.sort();
}

/** sha256 over sorted "<sha256(file)>  <path>\n" lines. */
export function hashFiles(root, paths) {
  const h = createHash('sha256');
  for (const p of paths) {
    h.update(
      `${createHash('sha256')
        .update(readFileSync(join(root, p)))
        .digest('hex')}  ${p}\n`,
    );
  }
  return h.digest('hex');
}
