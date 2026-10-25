# Provenance

Original work for VSSlicer (AGPL-3.0-or-later); no third-party code. A negative fixture for PLT-5: `src/index.ts` imports `eslint`, which `package.json` does not declare, so `pnpm build` must fail naming `eslint`. Run by `scripts/test/phantom-dep.test.mjs`. It lives outside `modules/` so `scripts/run.mjs` never builds it as a module.
