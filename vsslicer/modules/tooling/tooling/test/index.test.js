// SPDX-License-Identifier: AGPL-3.0-or-later
const test = require('node:test');
const assert = require('node:assert');
const { configs } = require('../src/index.js');

test('exports a config list', () => assert.ok(Array.isArray(configs)));
