// SPDX-License-Identifier: AGPL-3.0-or-later
import { MissingProductionPartError, UnsupportedRequiredExtensionError } from '../domain/errors.ts';
import type { Package } from '../domain/package.ts';
import type { ZipArchive } from './zipArchive.ts';

/** A `Package` plus the names of its thumbnail parts. */
export interface OpenedPackage extends Package {
  readonly thumbnails: readonly string[];
}

/** Extensions the reader understands (core, materials, production). Anything else in `requiredextensions` is refused. */
export const SUPPORTED_EXTENSIONS: ReadonlySet<string> = new Set([
  'http://schemas.microsoft.com/3dmanufacturing/core/2015/02',
  'http://schemas.microsoft.com/3dmanufacturing/material/2015/02',
  'http://schemas.microsoft.com/3dmanufacturing/production/2015/06',
]);

/** What the use case needs from the outside: the zip, the OPC layer and the root-model scan. */
export interface OpenPackageDeps {
  openZip(bytes: Uint8Array): ZipArchive;
  readPackage(zip: ZipArchive): Package;
  scanModel(
    bytes: Uint8Array,
    part: string,
  ): { requiredExtensions: readonly string[]; productionPaths: readonly string[] };
}

const isImage = (type: string): boolean => type === 'image/png' || type === 'image/jpeg';

/**
 * Opens a 3MF: zip, OPC parts, then the root model checks (required extensions, production parts exist).
 * Parts are eager: `readPackage` inflates every part, each bounded by the zip's per-entry cap. The root model is
 * inflated anyway for the checks; lazy bytes would need a `Part` change, taken up with VWR-32 if the 500 MB target needs it.
 * shortcut: only the root model is scanned for `p:path`, nested production models are checked when they are loaded.
 */
export function createOpenPackage(deps: OpenPackageDeps): (bytes: Uint8Array) => OpenedPackage {
  return (bytes) => {
    const pkg = deps.readPackage(deps.openZip(bytes));
    const root = pkg.parts.find((p) => p.name === pkg.rootModel);
    const scan = deps.scanModel(root?.bytes ?? new Uint8Array(), pkg.rootModel);
    const unsupported = scan.requiredExtensions.find((ns) => !SUPPORTED_EXTENSIONS.has(ns));
    if (unsupported !== undefined) throw new UnsupportedRequiredExtensionError(unsupported);
    const names = new Set(pkg.parts.map((p) => p.name));
    for (const path of scan.productionPaths) {
      const name = path.replace(/^\//, '');
      if (!names.has(name)) throw new MissingProductionPartError(path);
    }
    const thumbnails = pkg.parts
      .filter((p) => isImage(p.contentType) && /^Metadata\//i.test(p.name))
      .map((p) => p.name);
    return { ...pkg, thumbnails };
  };
}
