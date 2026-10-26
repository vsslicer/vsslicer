// SPDX-License-Identifier: AGPL-3.0-or-later
// Never returns and never yields: only terminate() stops it.
export default {
  formats: [],
  canHandle: () => true,
  import: () => {
    for (;;);
  },
};
