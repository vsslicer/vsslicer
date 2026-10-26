// SPDX-License-Identifier: AGPL-3.0-or-later
// Synchronous work of a fixed number of steps, standing in for a long parse.
export default {
  formats: [],
  canHandle: () => true,
  async import(files) {
    let x = 0;
    for (let i = 0; i < 400_000_000; i++) x = (x + i * files.length) % 1_000_003;
    return {
      entities: [],
      native: Object.create(null),
      diagnostics: [{ severity: 'info', code: 'unknown-type', file: '', message: `done ${x >= 0}` }],
    };
  },
};
