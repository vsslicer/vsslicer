# Changelog

## Unreleased

- SLC-13: `extractArchive` for zip and tar.gz with path-traversal and symlink guards, all-or-nothing staging, and entry, size and ratio bounds.
- SLC-277: the kill tests no longer depend on node start-up time.
- SLC-9: `runProcess` spawns an engine from an argv array (no shell) with bounded line streams and kept output, validated timeouts, process-group kill (SIGTERM then SIGKILL) and an exit/signal result.
- Module skeleton, no public API yet.
