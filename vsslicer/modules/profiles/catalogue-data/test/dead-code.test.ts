// SPDX-License-Identifier: AGPL-3.0-only
import { expect, test } from 'vitest';
import * as cura from '../tools/catalogue/cura.ts';

// PRF-217: the test-only upstream reader and source paths were deleted; nothing may bring them back unused.
test('cura.ts exports no readBounded or upstream source path', () => {
  for (const name of ['readBounded', 'CURA_SOURCE', 'FDM_MATERIALS_SOURCE'])
    expect(Object.keys(cura)).not.toContain(name);
});
