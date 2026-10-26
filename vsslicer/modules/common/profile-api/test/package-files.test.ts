// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const root = new URL('../', import.meta.url);
const { files } = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as { files: string[] };

// The published package must carry its licence and the provenance of the generated catalogues (SP8 audit, finding 5).
describe('published files', () => {
  test.each(['dist', 'LICENSE', 'PROVENANCE.md'])('package.json "files" lists %s', (entry) => {
    expect(files).toContain(entry);
  });

  test.each(['LICENSE', 'PROVENANCE.md'])('%s exists in the module', (name) => {
    expect(existsSync(new URL(name, root))).toBe(true);
  });
});
