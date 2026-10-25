# @vsslicer/test-webview

Playwright harness for VSSlicer webviews: Chromium with SwiftShader (software WebGL, no GPU needed), a stub of the VS Code webview host, and a Linux-only snapshot workflow. PLT-38 later moves the stub into the webview kit.

## Use the stub loader

```ts
import { startWebviewHost, webglRenderer } from '@vsslicer/test-webview';

const host = await startWebviewHost('/path/to/dist/webview.js');
await page.goto(host.url);
const messages = await page.evaluate(() => window.__vscode.messages); // everything the webview posted
await host.close();
```

The page carries a CSP like the extension would set (`default-src 'none'`, nonce-only scripts), defines `acquireVsCodeApi` (once per page, like VS Code; `postMessage` is recorded in `window.__vscode.messages`, `getState`/`setState` keep `window.__vscode.state`) and then loads the bundle. Also exported: `webviewPage`, `webviewCsp`, `stubScript`, `trianglePage`, `webglRenderer(page)` (the `WEBGL_debug_renderer_info` string; assert `/SwiftShader/i`).

Playwright is not a dependency of the package: install your own pinned `@playwright/test` and launch Chromium with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` (see `playwright.config.ts`).

## Scripts

- `pnpm test`: vitest, the stub loader's unit tests (fast, no browser).
- `pnpm test:snapshot`: Playwright (`npx playwright install chromium` once): SwiftShader check, the sample webview from `@vsslicer/example-extension` posts `{type:'ready'}`, and the WebGL2 triangle snapshot.

## Snapshot tolerance

`toHaveScreenshot('triangle.png', { maxDiffPixelRatio: 0.002, threshold: 0.1 })` on a 256x256 canvas: up to 0.2% of pixels (about 130) may differ, where a pixel counts as different above a YIQ colour distance of 0.1 (Playwright's default is 0.2). That absorbs edge anti-aliasing drift between Chromium builds and stays far below a colour or geometry change (a changed fill colour differs in about 32% of the pixels).

## Regenerating snapshots

Only Linux baselines exist, named `triangle-linux.png` (Playwright's `{arg}-{platform}` naming) under `test/triangle.spec.ts-snapshots/`.

- Snapshots are written only with `UPDATE_SNAPSHOTS=1` on Linux. On other platforms `UPDATE_SNAPSHOTS=1` and Playwright's own `--update-snapshots` / `-u` are refused with an error, everywhere.
- On macOS and Windows the snapshot test is skipped with a message unless a baseline for that platform exists (none is committed). The SwiftShader and webview tests still run.
- To compare or regenerate from a Mac, run in the matching image (it must match the pinned `@playwright/test`, now 1.64.1):

```sh
docker run --rm -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v1.64.1-noble sh -c \
  'npm i -g pnpm@11.22.0 && pnpm install && UPDATE_SNAPSHOTS=1 pnpm test:snapshot'
```

(Use a copy of the module without `node_modules`; while the registry is local, the container must reach it as `localhost:4873`, for example with a TCP forward to `host.docker.internal:4873`.) CI (PLT-18) runs `pnpm test:snapshot` on ubuntu and has a manual regenerate workflow.
