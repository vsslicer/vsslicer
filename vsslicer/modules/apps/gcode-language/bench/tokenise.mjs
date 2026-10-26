// SPDX-License-Identifier: AGPL-3.0-or-later
// Tokenises a generated 20 MB G-code file with the grammar (vscode-textmate + vscode-oniguruma), as the
// editor would if large-file optimisations did not switch tokenisation off, and prints the time.
// Usage: node bench/tokenise.mjs [megabytes=20]
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import oniguruma from 'vscode-oniguruma';
import textmate from 'vscode-textmate';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);
const wasm = readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm'));
await oniguruma.loadWASM(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength));
const registry = new textmate.Registry({
  onigLib: Promise.resolve({
    createOnigScanner: (patterns) => new oniguruma.OnigScanner(patterns),
    createOnigString: (s) => new oniguruma.OnigString(s),
  }),
  loadGrammar: async () =>
    textmate.parseRawGrammar(
      readFileSync(new URL('syntaxes/gcode.tmLanguage.json', root), 'utf8'),
      'gcode.tmLanguage.json',
    ),
});
const grammar = await registry.loadGrammar('source.gcode');

// the slicer excerpts repeated until the size is reached
const sample = ['prusaslicer', 'orca', 'bambu-studio', 'cura', 'superslicer']
  .map((n) => readFileSync(new URL(`test/fixtures/${n}.gcode`, root), 'utf8'))
  .join('');
const target = Number(process.argv[2] ?? 20) * 1024 * 1024;
const lines = [];
for (let size = 0; size < target;)
  for (const l of sample.split('\n')) {
    lines.push(l);
    size += l.length + 1;
  }

const start = performance.now();
let state = textmate.INITIAL;
let tokens = 0;
for (const line of lines) {
  const r = grammar.tokenizeLine(line, state);
  tokens += r.tokens.length;
  state = r.ruleStack;
}
const ms = performance.now() - start;
console.log(
  `${(target / 1024 / 1024).toFixed(0)} MB, ${lines.length} lines, ${tokens} tokens: ${(ms / 1000).toFixed(1)} s`,
);
