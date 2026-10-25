// SPDX-License-Identifier: AGPL-3.0-or-later
const test = require('node:test');
const assert = require('node:assert');
const { greet } = require('../dist/index.js');

test('greet', () => assert.strictEqual(greet('VSSlicer'), 'Hello, VSSlicer!'));
