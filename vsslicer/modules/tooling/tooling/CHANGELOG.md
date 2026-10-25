# Changelog

## 0.2.0

- Add `tsconfig.base.json` (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, NodeNext, ES2023), exported as `@vsslicer/tooling/tsconfig.base.json`.
- Add the `vsslicer-bundle` bin: bundles an extension entry to `dist/extension.js` (node, CommonJS, `vscode` external, sourcemap) with esbuild.
- Remove the placeholder `src/index.js` export.

## 0.1.0

- Initial scaffold.
