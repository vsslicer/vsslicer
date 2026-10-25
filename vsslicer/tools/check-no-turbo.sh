#!/usr/bin/env bash
# Proves the workspace builds with plain pnpm when turbo.json is absent.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
tar -C "$root" --exclude=node_modules --exclude=dist --exclude=.turbo --exclude=turbo.json -cf - . | tar -C "$tmp" -xf -
cd "$tmp"
pnpm install
pnpm -r run build
test -f packages/example/dist/index.js && test -f extensions/example/dist/extension.js
echo "check-no-turbo: OK"
