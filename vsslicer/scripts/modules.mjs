// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Module folders under modulesRoot, relative with '/' (e.g. 'printer/moonraker'). A folder with a package.json is a
 * module; any other top-level folder is a group (common, core, printer, ...) whose subfolders are the modules.
 */
export function moduleDirs(modulesRoot, warn = console.warn) {
  const sub = (d) =>
    readdirSync(join(modulesRoot, d), { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== 'node_modules')
      .map((e) => (d ? `${d}/${e.name}` : e.name));
  const isModule = (d) => existsSync(join(modulesRoot, d, 'package.json')) || (warn(`warning: modules/${d} has no package.json yet, skipping`), false);
  return sub('').flatMap((d) => (existsSync(join(modulesRoot, d, 'package.json')) ? [d] : sub(d).length ? sub(d).filter(isModule) : (isModule(d), [])));
}
