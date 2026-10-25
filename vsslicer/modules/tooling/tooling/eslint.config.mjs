// SPDX-License-Identifier: AGPL-3.0-or-later
import shared from './eslint.mjs';

// the lint fixtures are deliberate violations, linted explicitly by test/lint.test.mjs
export default [...shared, { ignores: ['test/fixtures/lint/**', 'test/fixtures/licence/**'] }];
