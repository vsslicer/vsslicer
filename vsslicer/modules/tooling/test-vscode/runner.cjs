// SPDX-License-Identifier: AGPL-3.0-or-later
// Test entry that runs inside the VS Code extension host (the `extensionTestsPath` of runTests).
// runIntegration passes the compiled suite directory and the result file through the environment.
const path = require('node:path');
const fs = require('node:fs');
const m = require('mocha');
const Mocha = m.Mocha ?? m.default ?? m; // the host's Node may hand back the ESM namespace

exports.run = () =>
  new Promise((resolve, reject) => {
    const dir = process.env.VSSLICER_TESTS_DIR;
    const out = process.env.VSSLICER_JUNIT_FILE;
    if (!dir || !out)
      return reject(new Error('VSSLICER_TESTS_DIR and VSSLICER_JUNIT_FILE must be set (use runIntegration)'));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const mocha = new Mocha({
      ui: 'bdd',
      color: false,
      timeout: 20000,
      reporter: 'xunit',
      reporterOptions: { output: out },
    });
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.test.js'))) mocha.addFile(path.join(dir, f));
    const runner = mocha.run((failures) =>
      failures ? reject(new Error(`${failures} integration test(s) failed`)) : resolve(),
    );
    new Mocha.reporters.Spec(runner); // console output beside the xunit file
  });
