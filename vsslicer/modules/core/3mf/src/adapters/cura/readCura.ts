// SPDX-License-Identifier: AGPL-3.0-or-later
import type { DialectReader } from '../../application/readProject.ts';
import type { Package } from '../../domain/package.ts';

/** Cura writes each container as `Cura/<id>.<suffix>` (Cura@5bea2f8:plugins/3MFWriter/ThreeMFWorkspaceWriter.py:171). */
const isContainer = (name: string): boolean => /^cura\/[^/]+\.cfg$/i.test(name);

/**
 * The `cura` dialect reader. Objects and instances come from the core read of the model. The `Cura/*.cfg` containers
 * are returned raw (same bytes, no INI parsing) in `rawConfig` by part name; every other non-model part is preserved.
 * shortcut: container files nested deeper than `Cura/` are preserved, not read; Cura writes none.
 */
export const createCuraReader =
  (readCore: (pkg: Package) => ReturnType<DialectReader>): DialectReader =>
  (pkg) => {
    const core = readCore(pkg);
    const containers = pkg.parts.filter((p) => isContainer(p.name));
    const preserved = pkg.parts.filter((p) => !isContainer(p.name) && !p.name.toLowerCase().endsWith('.model'));
    return {
      ...core,
      dialect: 'cura',
      rawConfig: new Map([...core.rawConfig, ...containers.map((p) => [p.name, p.bytes] as const)]),
      preserved: [...core.preserved, ...preserved],
    };
  };
