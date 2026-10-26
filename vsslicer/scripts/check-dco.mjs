#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Usage: node scripts/check-dco.mjs <base> <head>
// Applies from the first-push history rewrite onwards (the rewrite adds sign-offs to the existing history).
// Every non-merge commit in base..head needs a `Signed-off-by: Name <email>` trailer matching its author
// (name and email, email case-insensitive). Merge commits are skipped: they carry no authored change.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function dcoProblems(base, head, cwd = process.cwd()) {
  const r = spawnSync('git', ['log', '--no-merges', '--format=%H%x1f%an%x1f%ae%x1f%B%x1e', `${base}..${head}`], { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git log ${base}..${head} failed: ${r.stderr.trim()}`);
  return r.stdout.split('\x1e').map((s) => s.trim()).filter(Boolean).flatMap((rec) => {
    const [sha, name, email, body] = rec.split('\x1f');
    const signed = [...body.matchAll(/^Signed-off-by:[ \t]*(.+?)[ \t]*<([^>]*)>[ \t]*$/gim)].some(
      (m) => m[1] === name && m[2].toLowerCase() === email.toLowerCase(),
    );
    return signed ? [] : [`${sha.slice(0, 12)} lacks "Signed-off-by: ${name} <${email}>" (fix with: git commit --amend -s, or git rebase --signoff)`];
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [base, head] = process.argv.slice(2);
  if (!base || !head) (console.error('usage: node scripts/check-dco.mjs <base> <head>'), process.exit(2));
  const problems = dcoProblems(base, head);
  problems.forEach((p) => console.error(p));
  if (problems.length) process.exit(1);
  console.log(`dco: every commit in ${base}..${head} is signed off`);
}
