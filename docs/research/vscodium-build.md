# The VSSlicer build on VSCodium

How VSCodium builds VS Code, and what it takes to remove the stock chrome the owner doesn't want
(Accounts, the gear menu's Settings entry, Extensions and the MCP gallery, Run and Debug, Source
Control) from a VSSlicer build in the `vsslicer/vsslicer-build` repository. Researched 2026-10-27 by
the m6-planner agent; running notes in `.reference/notes/VSS-M6-vscodium.md`.

**Sources**

- VSCodium `vscodium@be70704` (`be70704abf84fc6c7721f94478dfcccd2dc6163e`, 2026-10-14), MIT.
- VS Code at the commit VSCodium pins: `vscode@07f806f` (tag `1.140.0`,
  `07f806f999227108933c2e30515b26eecc1fda74`, from `vscodium@be70704:upstream/stable.json`), MIT.
  All `vscode@07f806f` citations are under `src/vs/` unless the path says otherwise.
- `vscode@4ef6bab` (main, 1.144.0) only to measure churn at the patch sites.
- VSCodium's GitHub Actions run history through the GitHub API, read 2026-10-27.

## Findings

### 1. How VSCodium gets VS Code, patches it and sets `product.json`

- **Fetch.** `upstream/stable.json` pins a tag and commit (`vscodium@be70704:upstream/stable.json`).
  `get_repo.sh` reads it, or with `VSCODE_LATEST=yes` asks Microsoft's update API for the latest
  release (`vscodium@be70704:get_repo.sh:11-28`), then runs `git init` and
  `git fetch --depth 1 origin <commit>` and checks out `FETCH_HEAD` (`get_repo.sh:66-96`). It's a
  single shallow commit, no fork history.
- **`product.json`.** `prepare_vscode.sh` sets fields one by one with `jq setpath`
  (`prepare_vscode.sh:21-35`): the gallery points at Open VSX (`:39`), plus names, ids, Windows AppIds
  and the protocol (`:96-121`) and the update URL (`:53-65`). It then deep-merges the repo's own
  `product.json` over the result (`jq -s '.[0] * .[1]'`, `:126`). Our overlay can work the same way:
  one JSON file merged last.
- **Patches.** First the `patches/*.json` "actions", whose only action is `remove` (`rm -rf` of the
  listed paths, `utils.sh:19-43`). Then `patches/*.patch` in lexical order, then `insider/`, the OS
  folder and `user/` (`prepare_vscode.sh:150-182`). `apply_patch` fills in placeholders such as
  `!!APP_NAME!!` and runs `git apply --ignore-whitespace`. Any reject fails the build
  (`utils.sh:45-69`). VSCodium carries 56 entries in `patches/`; the largest are
  `00-ui-custom-font.patch` (270 KB), `53-ext-copilot-remove-it.patch` (208 KB) and
  `00-brand-remove-branding.patch` (172 KB).
- **Build.** `npm ci` is retried five times (`prepare_vscode.sh:207-223`), then
  `npm run gulp vscode-min-prepack` and `vscode-<os>-<arch>-min-packing`
  (`vscodium@be70704:build.sh:20-75`), with 12 GB of Node heap in CI (`publish-stable-macos.yml:15`).
- **Built-in extensions.** Bundled `extensions/*` folders are found with a glob, minus a short
  exclusion list (`vscode@07f806f:build/lib/extensions.ts:318-326,418-427`). Deleting a folder before
  the build drops that extension, which is what VSCodium's JSON `remove` action does
  (`vscodium@be70704:patches/52-ext-copilot-remove-it.json`). `product.json#builtInExtensions` entries
  are downloaded at build time, and an entry may name a local `vsix` with a `sha256`
  (`vscode@07f806f:build/lib/builtInExtensions.ts:18-31,82-100`; checksum check at
  `build/lib/extensions.ts:255-267`). **Our own extensions can therefore be built in from VSIX files
  through `product.json` alone.**

### 2. Rebases

- An upstream update is a manual "spearhead" workflow. It fetches the latest release, builds macOS
  arm64 and dispatches the other platforms (`vscodium@be70704:.github/workflows/publish-stable-spearhead.yml:1-87`).
  `update_upstream.sh` then commits the new pin, signed (`update_upstream.sh:11-30`).
- Fixing patches is manual too. `dev/update_patches.sh` applies each patch onto a throwaway
  "VSCODIUM HELPER" commit. When a patch fails, the script writes `.rej` files and waits for a person
  to resolve them (`dev/update_patches.sh:102-126`), then regenerates the patch with
  `git diff --staged -U1` (`:130`). Small patches with one-line context are what keep this cheap.
- **Our cost driver is the number of hunks in files upstream edits.** Between 1.140.0 and 1.144 the
  files our patches would touch changed by: `globalCompositeBar.ts` 39 lines, `debug.contribution.ts`
  8, `extensions.contribution.ts` 2, `common/views.ts` 1, `workbench.common.main.ts` 17, and
  `preferences.contribution.ts`, `scm.contribution.ts` and `build/lib/*` 0 (diff of `vscode@07f806f`
  against `vscode@4ef6bab`). We'd rebase on VSCodium's release tags, so VSCodium's own patches arrive
  already rebased.

### 3. CI and build time

- Linux runs a `compile` job, then one `build` job per architecture in
  `vscodium/vscodium-linux-build-agent:focal-*` containers
  (`vscodium@be70704:.github/workflows/publish-stable-linux.yml:51,134-158`). macOS runs on
  `macos-14`/`macos-15-intel`, Windows on `windows-2022`.
- Measured (run IDs from `gh api repos/VSCodium/vscodium/actions/...`, 2026-10-26): Linux compile
  7 min and linux-x64 build 12 min (run 40291339357). macOS arm64 20 min and x64 50 min
  (run 40291339350). Windows x64 59 min and arm64 69 min (run 40291339330). Whole workflows: Linux
  68–92 min, macOS 77–104 min, Windows 118–160 min (five runs per platform, April to October 2026).
- (unverified) The 7-minute compile and a 47-minute gap before the build jobs suggest caching or an
  environment approval that I didn't trace. Plan on **30–60 min for a cold single-target build** on a
  free runner. PLT-147 measures it.

### 4. Where each item to remove lives, and how to remove it

| Item | Contributed at (`vscode@07f806f`) | `product.json` or config enough? | Patch |
|---|---|---|---|
| Accounts activity entry | `ACCOUNTS_ACTIVITY_ID` `workbench/common/activity.ts:7`. Shown when `isAccountsActionVisible()`, which reads storage key `workbench.activity.showAccounts` with default `true` (`workbench/browser/parts/globalCompositeBar.ts:853-855`). Pushed at `:115-117`, toggles at `:146` and `:848`; the title bar uses the same check (`browser/parts/titlebar/titlebarPart.ts:768-769`). | No. It's a profile storage key with a code default. D23's profile hides it today, but the user can toggle it back. | **Small**: `isAccountsActionVisible` returns `false` and both toggle actions go. 1 file, 3 hunks, under 10 lines. |
| Gear menu "Settings" | `workbench.action.openSettings` registers `MenuId.GlobalActivity` (group `2_configuration`, order 2) and `MenubarPreferencesMenu` (`workbench/contrib/preferences/browser/preferences.contribution.ts:226-249`, gear entry at `:241`). The gear's "Extensions" entry is at `workbench/contrib/extensions/browser/extensions.contribution.ts:710`. | No. Extensions can't contribute to `GlobalActivity`: it isn't in `workbench/services/actions/common/menusExtensionPoint.ts`. Ctrl+, can be rebound by our extension's keybinding (unverified: extension keybindings outrank the `WorkbenchContrib` weight). | **Small**: remove the two menu entries (about 8 lines) and add gear items for `vsslicer.settings.open` and our extensions view (one `MenuRegistry.appendMenuItem` each, in our new contribution file below). |
| Extensions view container | `workbench/contrib/extensions/browser/extensions.contribution.ts:115-130` (`workbench.view.extensions`, Ctrl+Shift+X). | No. | **Generic** (see below). |
| MCP gallery | The MCP views are registered into the Extensions container (`workbench/contrib/mcp/browser/mcpServersView.ts:534-560`). The gallery URL comes from product key `mcpGallery` (`base/common/product.ts:166`, absent in Code-OSS) or setting `chat.mcp.gallery.serviceUrl` (`platform/mcp/common/mcpManagement.ts:316-317`, default `''`). | **Yes.** Leave out `mcpGallery`; the setting is empty by default. The views go when the Extensions container goes. | None. |
| Run and Debug container | `workbench/contrib/debug/browser/debug.contribution.ts:453-465` (Ctrl+Shift+D). It always has a view (the welcome view when `debugUx == simple`, `:474`). The Debug Console panel container is at `:426-433`. | No. Dropping `ms-vscode.js-debug` leaves the container in place. | **Generic.** |
| Source Control container | `workbench/contrib/scm/browser/scm.contribution.ts:56-64`. It's `hideIfEmpty`, but the Changes view and the "No source control providers registered." welcome content (`:69-72`) keep it visible even without git. | No. Dropping the `git` extension doesn't hide it. | **Generic.** |

**The generic patch.** `IViewContainersRegistry.deregisterViewContainer` exists
(`vscode@07f806f:workbench/common/views.ts:248-261`). Deregistering disposes the container's
open command (`workbench/services/views/browser/viewsService.ts:137,142`) and its activity-bar entry
(`workbench/browser/parts/paneCompositeBar.ts:243-249,366`); extension-contributed containers already
take this path. We add one new file, `src/vs/workbench/contrib/vsslicer/browser/vsslicer.contribution.ts`.
It deregisters every container id listed in a new `product.json` key (say
`vsslicer.removedViewContainers`: `workbench.view.extensions`, `workbench.view.debug`,
`workbench.view.scm`) and appends our gear entries. That file plus one import line in
`workbench/workbench.common.main.ts` comes to roughly 60 lines. A new file can't conflict on a
rebase, and the import line is the only hunk in a file upstream edits.

(unverified) What happens at runtime to views still registered against a deregistered container,
to the View menu's entries and to keybindings such as Ctrl+Shift+G (the SCM open command is
registered with `doNotRegisterOpenCommand`, `scm.contribution.ts:65`; Ctrl+Shift+G comes from the
Changes view's own open command at `:122-124`). Each removal card tests this, and falls back to an `if` around that one
`registerViewContainer` call if deregistering leaves errors.

**Totals: three source patches, about 80 changed lines**: Accounts (~10), gear menu (~10), and the
new contribution file with its import (~60). Plus `product.json` keys and a folder-removal list.

### 5. `extensionsGallery` and our own extensions view

- With no `extensionsGallery.serviceUrl`, the gallery manifest is `Unavailable`
  (`vscode@07f806f:platform/extensionManagement/common/extensionGalleryManifestService.ts:29,39-41`).
  Every gallery query POSTs to `${serviceUrl}/extensionquery` (`:46`). GitHub Pages can't serve a
  POST, so a static marketplace can't be a VS Code gallery (D24).
- `workbench.extensions.installExtension` takes an extension id or a VSIX URI
  (`workbench/contrib/extensions/browser/extensions.contribution.ts:438-446,523-524`). Our view can
  download a VSIX from a GitHub Release, check its `sha256` from `index.json`, and install it, with
  no gallery at all.
- (unverified) Without a gallery, VS Code neither auto-updates extensions nor fetches
  `extensionDependencies`. Our view installs in dependency order and offers updates itself.
- Settings can't be defaulted from `product.json` on desktop: only the web embedder has
  `configurationDefaults` (`workbench/services/configuration/browser/configuration.ts:48`). A built-in
  extension's `configurationDefaults` covers machine-overridable, window, resource and language
  settings, not APPLICATION-scope ones (`workbench/api/common/configurationExtensionPoint.ts:227-229`).

### 6. Dropping built-in extensions

- Microsoft's downloaded ones (`ms-vscode.js-debug`, `js-debug-companion`, ...) come from
  `product.json#builtInExtensions` (`vscode@07f806f:product.json:40-89`). We drop them by writing that
  list ourselves. **No patch needed.**
- Bundled ones such as `git`, `git-base`, `github`, `github-authentication`, `debug-auto-launch`,
  `debug-server-ready`, `npm`, `grunt`, `gulp` and `jake` are dropped with a `remove` action list
  before the build, as VSCodium already does. **No patch needed.** (unverified) Which of them other
  built-ins depend on. `extensions/*/package.json#extensionDependencies` must be checked per removal.

## Comparison

| Change | Mechanism | Survives rebases |
|---|---|---|
| Branding, ids, update URL, no gallery, no MCP gallery, our built-in VSIX files | `product.json` overlay | Yes |
| Drop git, debug and other built-ins | folder-removal list | Yes, unless a folder is renamed |
| Remove Extensions, Run and Debug, Source Control | new contribution file + `product.json` list | Yes. A new file, plus one import line |
| Gear menu: our Settings and Extensions entries | patch, about 10 lines in `preferences.contribution.ts` and `extensions.contribution.ts`, plus the new file | Mostly. 0 and 2 lines of churn in four minors |
| Accounts | patch, about 10 lines in `globalCompositeBar.ts` | Least stable: 39 lines of churn in four minors |

## Implications for VSSlicer

1. Build on VSCodium release tags, not raw VS Code. We inherit its de-Microsofting (telemetry,
   branding, marketplace) and add only our overlay, removal list and three patches.
2. Keep the VSSlicer behaviour in one new contribution file driven by `product.json`. Upstream edits
   then collide only with the import line, the gear entries and the Accounts hunk.
3. Don't set `extensionsGallery`. Our extensions view reads the static `index.json` and installs VSIX
   files (D24). Stock VS Code users keep the regular marketplaces.
4. Bundle our extensions as `builtInExtensions` entries with `vsix` and `sha256`.
5. Treat building as CI work. A cold build is tens of minutes and needs 12 GB of heap, so agent
   cards verify patches with `git apply --check` locally and leave full builds to CI.

## Licence notes

- VSCodium is MIT (`vscodium@be70704:LICENSE`); Code-OSS is MIT (`vscode@07f806f:LICENSE.txt`).
  Our patches, overlay and scripts are AGPL-3.0-or-later. That's compatible: the MIT notices are kept
  in `LICENSE.txt` and third-party notices.
- Microsoft's names and logos aren't covered by MIT. VSCodium strips them
  (`patches/00-brand-remove-branding.patch`), and our check for Microsoft marks (PLT-150) keeps them out.
- Microsoft's Marketplace terms forbid its use by other products (`vscodium@be70704:docs/extensions.md:20`).
  Our build has no gallery, so it can't reach it.
- Microsoft-licensed extensions (C#, Pylance, Remote, Copilot) can't ship. We drop `js-debug` as
  well, although it's MIT, because we don't need it.

## Open questions

- Whether deregistering a container leaves errors from its views or keybindings (unverified; tested
  by the removal cards).
- Whether to keep the Debug Console panel and the terminal. The owner listed only Run and Debug.
- Whether "Backup and Sync Settings" in the gear menu (which signs in through Accounts) goes along
  with Accounts. VSCodium has no settings sync server, so it's probably inert (unverified).
- The cold build time and runner size for our first linux-x64 CI build (PLT-147).
