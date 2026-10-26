// SPDX-License-Identifier: AGPL-3.0-or-later
import { constants } from 'node:fs';
import { open, opendir } from 'node:fs/promises';
import { join } from 'node:path';
import type { SourceFile } from '@vsslicer/profile-api';
import { treeLimits, type TreeDiagnostic, type TreeLimits } from './read-tree.ts';

/** Folder levels below the root: `<Vendor>/<machine|process|filament>/` plus slack for nested sub_paths. */
export const MAX_TREE_DIRS_DEEP = 8;

/**
 * Reads every `.json` file under `root` (an Orca or Bambu `resources/profiles` folder) as `SourceFile`s for
 * `readOrcaTree`. Symlinks are never followed, so the tree cannot reach outside `root` or loop; file size,
 * file count, total bytes and folder depth are capped with the same limits `readOrcaTree` applies.
 */
export async function loadProfileTree(
  root: string,
  limits?: Partial<TreeLimits>,
): Promise<{ files: SourceFile[]; diagnostics: TreeDiagnostic[] }> {
  const lim = treeLimits(limits);
  const files: SourceFile[] = [];
  const diagnostics: TreeDiagnostic[] = [];
  const report = (file: string, message: string, code: TreeDiagnostic['code'] = 'limit') =>
    diagnostics.push({ severity: 'error', code, file, message });
  let total = 0;
  const pending: { rel: string; depth: number }[] = [{ rel: '', depth: 0 }];
  while (pending.length > 0) {
    const { rel, depth } = pending.pop()!;
    // Leaving the for-await loop (also by return) closes the handle.
    let dir;
    try {
      dir = await opendir(join(root, rel));
    } catch (e) {
      report(rel, `unreadable folder: ${(e as Error).message.slice(0, 200)}`, 'missing-file');
      continue;
    }
    for await (const d of dir) {
      const path = rel === '' ? d.name : `${rel}/${d.name}`;
      if (d.isSymbolicLink()) {
        report(path, 'symbolic link; not followed', 'unsafe-path');
      } else if (d.isDirectory()) {
        if (depth + 1 > MAX_TREE_DIRS_DEEP) report(path, `folder deeper than ${MAX_TREE_DIRS_DEEP} levels; skipped`);
        else pending.push({ rel: path, depth: depth + 1 });
      } else if (d.isFile() && d.name.endsWith('.json')) {
        if (files.length >= lim.maxFiles) {
          report(path, `more than ${lim.maxFiles} files; the rest are ignored`);
          return { files, diagnostics };
        }
        // A file swapped for a link (O_NOFOLLOW) or a FIFO (O_NONBLOCK) after the listing is still refused.
        const fh = await open(
          join(root, path),
          constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0),
        ).catch(() => undefined);
        if (fh === undefined) {
          report(path, 'cannot be opened as a regular file', 'unsafe-path');
          continue;
        }
        try {
          const st = await fh.stat();
          if (!st.isFile()) report(path, 'not a regular file', 'unsafe-path');
          else if (st.size > lim.maxFileBytes) report(path, `larger than ${lim.maxFileBytes} bytes`);
          else if (total + st.size > lim.maxTotalBytes) {
            report(path, `files total more than ${lim.maxTotalBytes} bytes; the rest are ignored`);
            return { files, diagnostics };
          } else {
            // Reads at most the size stat gave, so a file growing meanwhile cannot pass the caps.
            const bytes = new Uint8Array(st.size);
            const { bytesRead } = await fh.read(bytes, 0, st.size, 0);
            total += bytesRead;
            files.push({ path, bytes: bytes.subarray(0, bytesRead) });
          }
        } finally {
          await fh.close();
        }
      }
    }
  }
  return { files, diagnostics };
}
