// SPDX-License-Identifier: AGPL-3.0-or-later
// Reports how many files it got and how much it summed, so a test can tell the files crossed the thread boundary.
export default {
  formats: [],
  canHandle: () => true,
  async import(files) {
    let sum = 0;
    for (const f of files) for (let i = 0; i < f.bytes.length; i++) sum += f.bytes[i];
    return {
      entities: [],
      native: Object.create(null),
      diagnostics: [{ severity: 'info', code: 'unknown-type', file: '', message: `${files.length} files, sum ${sum}` }],
    };
  },
};
