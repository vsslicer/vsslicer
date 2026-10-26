# Changelog

## Unreleased

- Fixed: a name collision with a symlink entry is now an `ArchiveError`, not a raw `EEXIST` (SLC-281).
- SLC-279: a name collision in `extractArchive` (Unicode or case alias) is an `ArchiveError`; the `gzip:` label is only for errors gunzip raised.
- SLC-280: `extractArchive` takes `{ sha256 }`, verified before extracting; a tar.gz without one is refused. The archive is opened once: the hash and the extraction read the same descriptor, so the verified bytes are the extracted bytes. The tar.gz ratio uses the archive size from that descriptor (for clarity; the required sha256 is the bound).
- SLC-13: `extractArchive` for zip and tar.gz with path-traversal and symlink guards, all-or-nothing staging, and entry, size and ratio bounds.
- SLC-277: the kill tests no longer depend on node start-up time.
- SLC-9: `runProcess` spawns an engine from an argv array (no shell) with bounded line streams and kept output, validated timeouts, process-group kill (SIGTERM then SIGKILL) and an exit/signal result.
- Module skeleton, no public API yet.
