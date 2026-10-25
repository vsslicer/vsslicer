# Changelog

## 0.2.1

- Depend on `@vsslicer/example` 0.3.0 and `@vsslicer/tooling` 0.3.0. Tests stay on `node --test` (the VS Code API is injected, nothing to gain from vitest here).

## 0.2.0

- Rewrite in TypeScript; `dist/extension.js` is now one esbuild bundle (`vscode` external, `@vsslicer/example` inlined), built with `@vsslicer/tooling` 0.2.0.
- Depend on `@vsslicer/example` ^0.2.0.

## 0.1.0

- Initial scaffold.
