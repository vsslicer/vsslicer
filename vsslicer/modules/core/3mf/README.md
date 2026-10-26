# @vsslicer/3mf

Reads, inspects and saves 3MF packages (zip, OPC, model XML, slicer project metadata). Layers:
`domain` (types, errors; pure), `application` (use cases and ports), `adapters` (zip, XML).

## Decision: XML parser and byte-identical save (VWR-1)

The model XML is parsed with **saxes 6.0.0** (ISC; one dependency, xmlchars 2.2.0, MIT), a push SAX
parser that streams chunks, so a 100 MB `3dmodel.model` never has to sit in memory as one string. On
a synthetic 105 MB model (1.17 M vertices, 0.87 M triangles, Node 26, one run) it took 1.16 s at
79 MB peak RSS, against 3.04 s / 743 MB for txml 6.0.3 (MIT, whole-string) and 6.65 s / 810 MB for
fast-xml-parser 5.11.2 (MIT, whole-string). It is pure JS with no Node built-ins, so the same code runs
in the extension host and, bundled, in the webview (fed by `TextDecoder` with `stream: true`). The zip
is read and written with **fflate 0.8.3** (MIT, no dependencies). fflate can hand out raw compressed
entry bytes (`Unzip.register` with a pass-through decoder for method 8), but it always writes its own
local and central headers and exposes no CRC on read, so it cannot save an entry byte-identically.
Saving therefore uses our own **local-header copier** in the adapters layer: it reads the central
directory, copies every unchanged entry's local record (header, data, data descriptor) verbatim,
writes only changed entries through fflate, and rebuilds the central directory and end record with
new offsets. The spike prototype (32 lines) kept every untouched entry byte-identical and reproduced
an unchanged file exactly on zips from Python `zipfile` and fflate. ZIP64 and archive comments are
still to do. Spike notes: `.reference/notes/VWR-1-xml-zip-spike.md`.
