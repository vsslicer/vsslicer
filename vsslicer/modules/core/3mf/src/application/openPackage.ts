// SPDX-License-Identifier: AGPL-3.0-or-later
import { MissingProductionPartError, UnsupportedRequiredExtensionError } from '../domain/errors.ts';
import type { Package } from '../domain/package.ts';
import { makeEditable } from './editPackage.ts';
import type { EditablePackage, EditPackageDeps } from './editPackage.ts';
import type { ZipArchive } from './zipArchive.ts';

/** A `Package` plus the names of its thumbnail parts. */
export interface OpenedPackage extends Package {
  readonly thumbnails: readonly string[];
  /** Set when a model requires a known extension VSSlicer only detects: the user notice, naming it. Edits are refused. */
  readonly readOnly?: string;
}

/** Extensions the reader understands (core, materials, production). Anything else in `requiredextensions` is refused. */
export const SUPPORTED_EXTENSIONS: ReadonlySet<string> = new Set([
  'http://schemas.microsoft.com/3dmanufacturing/core/2015/02',
  'http://schemas.microsoft.com/3dmanufacturing/material/2015/02',
  'http://schemas.microsoft.com/3dmanufacturing/production/2015/06',
]);

const MS = 'http://schemas.microsoft.com/3dmanufacturing/';
const IO = 'http://schemas.3mf.io/3dmanufacturing/';
/** Extensions VSSlicer recognises but does not read: a package requiring one opens read-only. */
export const DETECTED_EXTENSIONS: ReadonlyMap<string, string> = new Map([
  [`${MS}slice/2015/07`, 'Slice'],
  [`${MS}beamlattice/2017/02`, 'Beam Lattice'],
  [`${MS}beamlattice/balls/2020/07`, 'Beam Lattice balls'],
  [`${IO}volumetric/2022/01`, 'Volumetric'],
  [`${IO}implicit/2023/12`, 'Volumetric implicit'],
  [`${IO}booleanoperations/2023/07`, 'Boolean Operations'],
  [`${IO}displacement/2023/10`, 'Displacement'],
  // The consortium's own Displacement examples use the microsoft.com prefix.
  [`${MS}displacement/2023/10`, 'Displacement'],
  [`${MS}securecontent/2019/04`, 'Secure Content'],
]);

/** What the use case needs from the outside: the zip, the OPC layer and the root-model scan. */
export interface OpenPackageDeps extends EditPackageDeps {
  openZip(bytes: Uint8Array): ZipArchive;
  readPackage(zip: ZipArchive): Package;
  scanModel(
    bytes: Uint8Array,
    part: string,
  ): { requiredExtensions: readonly string[]; productionPaths: readonly string[] };
}

const isImage = (type: string): boolean => type === 'image/png' || type === 'image/jpeg';

/**
 * Opens a 3MF: zip, OPC parts, then the model checks: every model reached through `p:path` from the root exists, and
 * the required extensions of all of them are supported, or detected (the package opens read-only with a notice).
 * Parts are eager: `readPackage` inflates every part, each bounded by the zip's per-entry cap. The root model is
 * inflated anyway for the checks; lazy bytes would need a `Part` change, taken up with VWR-32 if the 500 MB target needs it.
 */
export function createOpenPackage(deps: OpenPackageDeps): (bytes: Uint8Array) => EditablePackage {
  return (bytes) => {
    const zip = deps.openZip(bytes);
    const pkg = deps.readPackage(zip);
    const bytesOf = new Map(pkg.parts.map((p) => [p.name, p.bytes]));
    const detected = new Set<string>();
    // Breadth-first over the models the root reaches; `seen` stops reference loops.
    const seen = new Set([pkg.rootModel]);
    for (const name of seen) {
      const scan = deps.scanModel(bytesOf.get(name) ?? new Uint8Array(), name);
      for (const ns of scan.requiredExtensions) {
        if (DETECTED_EXTENSIONS.has(ns)) detected.add(DETECTED_EXTENSIONS.get(ns)!);
        else if (!SUPPORTED_EXTENSIONS.has(ns)) throw new UnsupportedRequiredExtensionError(ns);
      }
      for (const path of scan.productionPaths) {
        const target = path.replace(/^\//, '');
        if (!bytesOf.has(target)) throw new MissingProductionPartError(path);
        seen.add(target);
      }
    }
    const readOnly =
      detected.size === 0
        ? undefined
        : `This 3MF requires ${[...detected].join(', ')}, which VSSlicer can show only in part, so it opens read-only.`;
    const thumbnails = pkg.parts
      .filter((p) => isImage(p.contentType) && /^Metadata\//i.test(p.name))
      .map((p) => p.name);
    return makeEditable(deps, bytes, zip, { ...pkg, thumbnails, ...(readOnly !== undefined && { readOnly }) });
  };
}
