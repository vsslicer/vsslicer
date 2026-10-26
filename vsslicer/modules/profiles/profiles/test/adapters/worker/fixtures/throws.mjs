// SPDX-License-Identifier: AGPL-3.0-or-later
export default () => ({
  formats: [],
  canHandle: () => true,
  import: async () => {
    throw new Error('boom from the importer');
  },
});
