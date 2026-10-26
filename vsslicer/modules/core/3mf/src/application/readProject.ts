// SPDX-License-Identifier: AGPL-3.0-or-later
import { detectDialect } from '../domain/detectDialect.ts';
import type { Package } from '../domain/package.ts';
import type { Dialect, Project } from '../domain/project/project.ts';

/** Maps a package of one dialect to a `Project`. May throw; the dispatcher then falls back to core. */
export type DialectReader = (pkg: Package) => Project;

export interface ReadProjectDeps {
  /** The core reader: root model and production parts to a `core` Project. Its errors propagate. */
  readCore(pkg: Package): Project;
  /** `<metadata>` of the root model, for dialect detection. */
  readMetadata(pkg: Package): ReadonlyMap<string, string>;
  /** Dialect readers by dialect. A dialect without one is treated like a disabled one. */
  readers?: ReadonlyMap<Dialect, DialectReader>;
  /** Dialects whose reader is switched off (setting or kill switch). */
  disabled?: ReadonlySet<Dialect>;
}

const message = (e: unknown): string => (e instanceof Error ? e.message : String(e));

/**
 * Detects the dialect, then reads with that dialect's reader. A missing, disabled or failing reader falls back to the
 * core read plus the parts the core reader does not interpret, and `notices` says why. A `core` package takes the same
 * read without a notice and never reaches a reader; errors of the core read itself never fall back.
 * shortcut: the parts the core read interprets are taken to be `.model` parts; a model reached by a non-model name is
 * preserved too, which is harmless. Revisit if a dialect needs another rule.
 */
export function createReadProject(deps: ReadProjectDeps): (pkg: Package) => Project {
  return (pkg) => {
    const { dialect } = detectDialect(
      deps.readMetadata(pkg),
      pkg.parts.map((p) => p.name),
    );
    const reader = deps.readers?.get(dialect);
    let why: string | undefined;
    if (dialect === 'core') why = undefined;
    else if (deps.disabled?.has(dialect)) why = 'its reader is disabled';
    else if (!reader) why = 'it has no reader';
    else {
      try {
        return reader(pkg);
      } catch (e) {
        why = `its reader failed: ${message(e)}`;
      }
    }
    const core = deps.readCore(pkg);
    const preserved = pkg.parts.filter((p) => !p.name.toLowerCase().endsWith('.model'));
    if (why === undefined) return { ...core, preserved: [...core.preserved, ...preserved] };
    return {
      ...core,
      preserved: [...core.preserved, ...preserved],
      notices: [
        ...(core.notices ?? []),
        `Detected a ${dialect} project, but ${why}: opened as a plain 3MF, with the ${dialect} settings kept untouched.`,
      ],
    };
  };
}
