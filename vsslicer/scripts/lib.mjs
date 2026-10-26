// SPDX-License-Identifier: AGPL-3.0-or-later
// Pure logic for run.mjs: no git, no registry, no file system.

/**
 * modules: [{ name, deps: [module names], devDeps?: [names only a devDependency] }] -> names, dependencies first.
 * A devDependency resolves from the registry, so a dev edge inside a cycle is dropped (one note via `note`);
 * a cycle through runtime dependencies throws. Linear and iterative (no recursion): Tarjan SCCs, then one DFS. The note goes to stderr: stdout carries machine-readable output.
 */
export function order(modules, note = console.error) {
  const byName = new Map(modules.map((m) => [m.name, m]));
  const names = [...byName.keys()].sort();
  const edgeCache = new Map();
  const edges = (n) => {
    if (!edgeCache.has(n)) edgeCache.set(n, [...byName.get(n).deps].filter((d) => byName.has(d)).sort());
    return edgeCache.get(n);
  };
  // Tarjan (iterative): scc id per module
  const idx = new Map(),
    low = new Map(),
    scc = new Map(),
    st = [];
  let counter = 0,
    sccs = 0;
  for (const root of names) {
    if (idx.has(root)) continue;
    const work = [[root, 0]];
    (idx.set(root, counter), low.set(root, counter++), st.push(root));
    while (work.length) {
      const top = work[work.length - 1];
      const [n] = top;
      const es = edges(n);
      if (top[1] < es.length) {
        const d = es[top[1]++];
        if (!idx.has(d)) {
          (idx.set(d, counter), low.set(d, counter++), st.push(d));
          work.push([d, 0]);
        } else if (!scc.has(d)) low.set(n, Math.min(low.get(n), idx.get(d)));
      } else {
        work.pop();
        if (low.get(n) === idx.get(n)) {
          for (let x; x !== n;) scc.set((x = st.pop()), sccs);
          sccs++;
        }
        if (work.length) {
          const p = work[work.length - 1][0];
          low.set(p, Math.min(low.get(p), low.get(n)));
        }
      }
    }
  }
  const dropped = [];
  const keepCache = new Map();
  const keep = (n) => {
    if (!keepCache.has(n))
      keepCache.set(
        n,
        edges(n).filter((d) => {
          const drop = byName.get(n).devDeps?.includes(d) && scc.get(n) === scc.get(d);
          if (drop) dropped.push(`${n} -> ${d}`);
          return !drop;
        })
      );
    return keepCache.get(n);
  };
  // DFS (iterative) with an on-path set, so cycle detection is O(1) per edge
  const done = new Set();
  const onPath = new Set();
  const out = [];
  for (const root of names) {
    if (done.has(root)) continue;
    const path = [[root, 0]];
    onPath.add(root);
    while (path.length) {
      const top = path[path.length - 1];
      const es = keep(top[0]);
      if (top[1] < es.length) {
        const d = es[top[1]++];
        if (done.has(d)) continue;
        if (onPath.has(d)) {
          const names = path.map((p) => p[0]);
          throw new Error(`dependency cycle: ${[...names.slice(names.indexOf(d)), d].join(' -> ')}`);
        }
        onPath.add(d);
        path.push([d, 0]);
      } else {
        path.pop();
        onPath.delete(top[0]);
        done.add(top[0]);
        out.push(top[0]);
      }
    }
  }
  if (dropped.length) note(`note: ordering ignores devDependency edge(s) closing a cycle: ${dropped.join(', ')}`);
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

/** A 0.0.0 module is unreleased by definition: publish skips it and no module may depend on it. */
export const isUnreleased = (m) => m.version === '0.0.0';

/** modules: [{ name, version, deps }] -> one message per dependency on an unreleased @vsslicer/* module. */
export function unreleasedDepProblems(modules) {
  const unreleased = new Set(modules.filter(isUnreleased).map((m) => m.name));
  return modules.flatMap((m) => m.deps.filter((d) => unreleased.has(d)).map((d) => `${m.name} depends on ${d}, which is at unreleased version 0.0.0`));
}
