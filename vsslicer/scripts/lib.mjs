// SPDX-License-Identifier: AGPL-3.0-or-later
// Pure logic for run.mjs: no git, no registry, no file system.

/** modules: [{ name, deps: [module names] }] -> names, dependencies first. Throws on a cycle. */
export function order(modules) {
  const byName = new Map(modules.map((m) => [m.name, m]));
  const done = new Set();
  const stack = [];
  const out = [];
  const visit = (name) => {
    if (done.has(name)) return;
    const at = stack.indexOf(name);
    if (at >= 0) throw new Error(`dependency cycle: ${[...stack.slice(at), name].join(' -> ')}`);
    stack.push(name);
    for (const d of [...byName.get(name).deps].sort()) if (byName.has(d)) visit(d);
    stack.pop();
    done.add(name);
    out.push(name);
  };
  for (const name of [...byName.keys()].sort()) visit(name);
  return out;
}

/** Modules whose directory holds a changed file, plus everything that transitively depends on them. */
export function changed(modules, files) {
  // the runner, registry and node pin affect every module
  if (files.some((f) => f.startsWith('scripts/') || f === '.nvmrc')) return new Set(modules.map((m) => m.name));
  const hit = new Set(
    modules.filter((m) => files.some((f) => f.startsWith(`modules/${m.dir}/`))).map((m) => m.name),
  );
  for (let grew = true; grew; ) {
    grew = false;
    for (const m of modules)
      if (!hit.has(m.name) && m.deps.some((d) => hit.has(d))) (hit.add(m.name), (grew = true));
  }
  return hit;
}

/** @vsslicer/* names a package.json depends on (dependencies, devDependencies, peerDependencies). */
export function localDeps(pkg) {
  const all = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
  return Object.keys(all).filter((n) => n.startsWith('@vsslicer/'));
}

/** names plus everything they transitively depend on (those get built and published, not tested). */
export function withDeps(modules, names) {
  const byName = new Map(modules.map((m) => [m.name, m]));
  const out = new Set();
  const add = (n) => {
    if (out.has(n) || !byName.has(n)) return;
    out.add(n);
    byName.get(n).deps.forEach(add);
  };
  names.forEach(add);
  return out;
}

/** fetch that retries thrown errors: node's fetch sometimes hits a keep-alive socket the registry just closed. */
export async function fetchRetry(url, fetchFn = fetch, tries = 3) {
  for (let i = 1; ; i++)
    try {
      return await fetchFn(url);
    } catch (e) {
      if (i >= tries) throw e;
    }
}
