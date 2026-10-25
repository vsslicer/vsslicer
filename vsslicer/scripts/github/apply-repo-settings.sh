#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
# Apply repo settings and the main ruleset. Usage: apply-repo-settings.sh [--dry-run] <owner/repo>
set -euo pipefail
dry=0; [ "${1:-}" = "--dry-run" ] && { dry=1; shift; }
repo="${1:?usage: $0 [--dry-run] <owner/repo>}"
rules="$(cd "$(dirname "$0")/../../.." && pwd)/.github/rulesets/main.json"
run() { if [ "$dry" = 1 ]; then printf '%q ' "$@"; echo; else "$@"; fi; }
run gh api -X PATCH "repos/$repo" -F has_issues=true -F has_wiki=false
# Creates the ruleset; re-running after it exists fails with 422 (update it via PUT rulesets/<id>).
run gh api -X POST "repos/$repo/rulesets" --input "$rules"
