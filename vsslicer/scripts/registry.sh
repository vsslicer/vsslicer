#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
# Local Verdaccio registry (D12). Usage: registry.sh start|stop|status
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
dir="$here/../.registry"
pidfile="$dir/pid"
url="http://localhost:4873"
up() { curl -fs "$url/-/ping" >/dev/null 2>&1; }
alive() { [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null; }
case "${1:-}" in
  start)
    if up; then echo "registry already running at $url"; exit 0; fi
    mkdir -p "$dir"
    [ -d "$here/node_modules" ] || (cd "$here" && pnpm install --frozen-lockfile)
    # own process group so stop can kill verdaccio and anything it spawned
    nohup "$here/node_modules/.bin/verdaccio" -c "$here/verdaccio/config.yaml" -l localhost:4873 \
      >"$dir/verdaccio.log" 2>&1 &
    echo $! >"$pidfile"
    for _ in $(seq 1 60); do
      if up; then echo "registry running at $url (pid $(cat "$pidfile"))"; exit 0; fi
      alive || { echo "registry exited early; see $dir/verdaccio.log" >&2; exit 1; }
      sleep 0.5
    done
    echo "registry did not answer within 30s; see $dir/verdaccio.log" >&2; exit 1 ;;
  stop)
    if alive; then
      kill "$(cat "$pidfile")"
      for _ in $(seq 1 40); do alive || break; sleep 0.25; done
      alive && kill -9 "$(cat "$pidfile")"
    fi
    rm -f "$pidfile"
    if up; then echo "something else still answers on $url" >&2; exit 1; fi
    echo "registry stopped" ;;
  status)
    if up; then echo "running at $url"; else echo "not running"; exit 1; fi ;;
  *) echo "usage: $0 start|stop|status" >&2; exit 2 ;;
esac
