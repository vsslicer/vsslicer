// SPDX-License-Identifier: AGPL-3.0-or-later
// Reads Cura's `definitions/`, `extruders/` and `variants/` below a `resources/` folder into SourceFiles for
// readCuraResources. Cura walks with `followlinks = True` and skips dot names (Uranium@e65ccc1:UM/Resources.py:118-123,
// LGPL-3.0); this reader skips dot names too but never follows a symbolic link (rule 25), and opens each file with
// O_NOFOLLOW so a file swapped for a link after listing is refused. Each folder is `lstat`ed before `opendir`
// (which follows links) and again after listing; a link, or a folder whose (dev, ino) changed, is refused.
// shortcut: a folder swapped for a link and back between the two `lstat`s is still read; closing that needs an
// fd-based readdir, which Node lacks.
import type { Diagnostic, SourceFile } from '@vsslicer/profile-api';
import { constants } from 'node:fs';
import { lstat, open, opendir } from 'node:fs/promises';
import { join } from 'node:path';
import { curaResourceOf, MAX_RESOURCE_DIAGNOSTICS, resolveResourceLimits, type CuraResourceLimits } from './read.ts';

const FOLDERS = ['definitions', 'extruders', 'variants'] as const;

export async function readCuraResourceFolder(
  root: string,
  limits: Partial<CuraResourceLimits> = {},
): Promise<{ files: SourceFile[]; diagnostics: Diagnostic[] }> {
  const lim = resolveResourceLimits(limits);
  const files: SourceFile[] = [];
  const diagnostics: Diagnostic[] = [];
  const diag = (severity: Diagnostic['severity'], file: string, message: string) => {
    if (diagnostics.length < MAX_RESOURCE_DIAGNOSTICS) {
      diagnostics.push({ severity, code: 'unreadable-folder', file, message });
    }
  };
  let entries = 0;
  let total = 0;
  let found = false;

  // Breadth first, sorted per folder, so the first file of an id is the same on every file system.
  const queue: { rel: string; depth: number }[] = [];
  for (const top of FOLDERS) queue.push({ rel: top, depth: 0 });
  while (queue.length > 0) {
    const { rel, depth } = queue.shift()!;
    let names: { name: string; kind: 'file' | 'dir' | 'link' | 'other' }[] = [];
    try {
      const before = await lstat(join(root, rel));
      if (before.isSymbolicLink()) {
        diag('warning', rel, 'symbolic link not followed');
        continue;
      }
      const dir = await opendir(join(root, rel));
      found = true;
      for await (const d of dir) {
        if (++entries > lim.maxFiles) {
          diag('error', rel, `more than ${lim.maxFiles} entries; the rest are not read`);
          return { files, diagnostics };
        }
        const kind = d.isSymbolicLink() ? 'link' : d.isDirectory() ? 'dir' : d.isFile() ? 'file' : 'other';
        names.push({ name: d.name, kind });
      }
      const after = await lstat(join(root, rel));
      if (after.isSymbolicLink() || after.dev !== before.dev || after.ino !== before.ino) {
        diag('error', rel, 'changed to another folder while read; not read');
        continue;
      }
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT' && depth === 0) continue;
      diag('error', rel, `not readable: ${(e as Error).message}`);
      continue;
    }
    names = names.filter((n) => !n.name.startsWith('.')).sort((a, b) => (a.name < b.name ? -1 : 1));
    for (const { name, kind } of names) {
      const path = `${rel}/${name}`;
      if (kind === 'link') diag('warning', path, 'symbolic link not followed');
      else if (kind === 'dir') {
        if (depth + 1 > lim.maxFolderDepth) diag('error', path, `deeper than ${lim.maxFolderDepth} folders; not read`);
        else queue.push({ rel: path, depth: depth + 1 });
      } else if (kind === 'file' && curaResourceOf(path)) {
        const bytes = await readCapped(join(root, path), lim.maxFileBytes);
        if (typeof bytes === 'string') {
          diag('error', path, bytes);
          continue;
        }
        total += bytes.length;
        if (total > lim.maxTotalBytes) {
          diag('error', path, `over ${lim.maxTotalBytes} bytes in all; the rest are not read`);
          return { files, diagnostics };
        }
        files.push({ path, bytes });
      }
    }
  }
  if (!found) diag('error', root, 'no definitions, extruders or variants folder');
  return { files, diagnostics };
}

/** The file's bytes, or why not: never follows a link, never reads past `max` + 1 bytes. */
async function readCapped(path: string, max: number): Promise<Uint8Array | string> {
  let handle;
  try {
    handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch (e) {
    return `not readable: ${(e as Error).message}`;
  }
  try {
    const stat = await handle.stat();
    if (!stat.isFile()) return 'not a regular file';
    // One byte past the stat size (capped) detects a file that grew, without allocating `max` for every file.
    const buf = new Uint8Array(Math.min(stat.size, max) + 1);
    let n = 0;
    while (n < buf.length) {
      const { bytesRead } = await handle.read(buf, n, buf.length - n, n);
      if (bytesRead === 0) break;
      n += bytesRead;
    }
    if (n > max) return `over the ${max} byte limit; not read`;
    return n > stat.size ? `changed while read; not read` : buf.slice(0, n);
  } finally {
    await handle.close();
  }
}
