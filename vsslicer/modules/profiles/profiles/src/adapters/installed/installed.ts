// SPDX-License-Identifier: AGPL-3.0-or-later
// Read-only walk of an installed slicer configuration folder (PRF-36); the files go to an importer, nothing is written.
import { open, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Diagnostic, Importer, ImportResult, SourceFile } from '@vsslicer/profile-api';
import { clip, errorText, MAX_IMPORT_FILES } from '../../application/import/registry.ts';

/** Deepest folder level read below the root; deeper folders are skipped with a diagnostic. */
export const MAX_FOLDER_DEPTH = 16;
/** Largest single file read; larger ones are skipped with a diagnostic. */
export const MAX_FILE_BYTES = 16 * 1024 * 1024;
/** Total bytes read in one call, across every file. */
export const MAX_TOTAL_BYTES = 512 * 1024 * 1024;
/** Directory entries examined in one call, files, folders and skipped links together. */
export const MAX_ENTRIES = 200_000;

/** The three whole-call caps; tests pass small ones, callers use the defaults. */
export interface FolderLimits {
  maxEntries: number;
  maxTotalBytes: number;
  maxFiles: number;
}
const DEFAULT_LIMITS: FolderLimits = {
  maxEntries: MAX_ENTRIES,
  maxTotalBytes: MAX_TOTAL_BYTES,
  maxFiles: MAX_IMPORT_FILES,
};

export interface InstalledFolder {
  files: SourceFile[];
  diagnostics: Diagnostic[];
}

const diag = (severity: Diagnostic['severity'], file: string, message: string): Diagnostic => ({
  severity,
  code: 'unreadable-folder',
  file: clip(file),
  message: clip(message),
});

/** Every regular file under `root`, with paths relative to it and `/`-separated. Never writes, never follows links. */
export async function readInstalledFolder(
  root: string,
  limits: FolderLimits = DEFAULT_LIMITS,
): Promise<InstalledFolder> {
  const out: InstalledFolder = { files: [], diagnostics: [] };
  let entries = 0;
  let bytes = 0;
  let full = false;
  const stop = (where: string, why: string) => {
    if (!full) out.diagnostics.push(diag('error', where, `${why}; the rest of the folder is not read`));
    full = true;
  };

  async function walk(dir: string, rel: string, depth: number): Promise<void> {
    let names;
    try {
      names = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      out.diagnostics.push(diag('error', rel || root, `cannot read the folder: ${errorText(error)}`));
      return;
    }
    // readdir order is file-system defined; sort by code unit so caps and diagnostics are deterministic.
    names.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const e of names) {
      if (full) return;
      if (++entries > limits.maxEntries) return stop(rel || root, `more than ${limits.maxEntries} entries`);
      const path = join(dir, e.name);
      const relPath = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (depth >= MAX_FOLDER_DEPTH)
          out.diagnostics.push(diag('warning', relPath, `deeper than ${MAX_FOLDER_DEPTH} levels, skipped`));
        else await walk(path, relPath, depth + 1);
      } else if (e.isFile()) {
        if (out.files.length >= limits.maxFiles) return stop(relPath, `more than ${limits.maxFiles} files`);
        try {
          // shortcut: a file swapped for a link between readdir and open is followed; fstat on the handle still bounds the read.
          const h = await open(path, 'r');
          try {
            const size = (await h.stat()).size;
            if (size > MAX_FILE_BYTES) {
              out.diagnostics.push(
                diag('warning', relPath, `${size} bytes is more than the ${MAX_FILE_BYTES} one file reads, skipped`),
              );
              continue;
            }
            if (bytes + size > limits.maxTotalBytes) return stop(relPath, `more than ${limits.maxTotalBytes} bytes`);
            const buf = new Uint8Array(size);
            let read = 0;
            while (read < size) {
              const { bytesRead } = await h.read(buf, read, size - read, read);
              if (bytesRead === 0) break;
              read += bytesRead;
            }
            bytes += read;
            out.files.push({ path: relPath, bytes: buf.subarray(0, read) });
          } finally {
            await h.close();
          }
        } catch (error) {
          out.diagnostics.push(diag('error', relPath, `cannot read the file: ${errorText(error)}`));
        }
      } else
        out.diagnostics.push(diag('info', relPath, 'not a regular file or folder (link or special file), skipped'));
    }
  }

  await walk(root, '', 0);
  return out;
}

/** Walk `root`, pass the files to `importer`, and return its result with the walk's diagnostics appended. */
export async function importInstalledFolder(root: string, importer: Importer): Promise<ImportResult> {
  const folder = await readInstalledFolder(root);
  const result = await importer.import(folder.files);
  return { ...result, diagnostics: [...result.diagnostics, ...folder.diagnostics] };
}
