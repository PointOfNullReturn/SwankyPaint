# Epic 06 Stories – Persistence & ILBM Import

## Story 06.01 – JSON Project Save/Load _(Status: ✅ Completed)_
**Goal:** Serialize and deserialize full project state.
**Acceptance Criteria:**
- `saveProject(document, view)` returns JSON with version, dimensions, mode, base64 pixels, palette, cycles, view (zoom, offsets, grid), FG/BG indices.
- `loadProject(json)` validates schema, allocates buffers, restores palette/FG/BG, view, and pushes a command so undo reverts to previous state.
- Round-trip tests ensure equality for sample projects in both Indexed8 and RGBA modes.

**Notes:**
- Defined a portable `ProjectSnapshot` schema with base64 encoding helpers for pixel buffers plus palette/view metadata.
- `saveProject`/`serializeProject` capture document, view, palette slices; `loadProject` parses snapshots, builds typed arrays, and executes `LoadProjectCommand` for undoable state restoration.
- Coverage includes indexed + RGBA round-trips and validation failures.

## Story 06.02 – PNG Export Pipeline _(Status: ✅ Completed)_
**Goal:** Export the current canvas as PNG.
**Acceptance Criteria:**
- Indexed documents convert palette indices to RGBA ImageData before encoding; RGBA docs reuse buffer directly.
- Browser export uses Blob + download link; tests rely on mock `URL.createObjectURL` verifying binary length.
- Export respects zoom-independent document size (no UI chrome included) and includes metadata (e.g., sRGB).

**Notes:**
- Added `documentToRgba` conversion plus `exportCurrentDocumentToPng`, which draws to an offscreen canvas and triggers a download via Blob/ObjectURL.
- Indexed docs map palette indices before encoding; RGBA docs reuse their existing buffer.
- Vitest suite mocks canvas, toBlob, ImageData, and URL APIs to prove export wiring.

## Story 06.03 – ILBM Parser Modules _(Status: ✅ Completed)_
**Goal:** Parse FORM/BMHD/CMAP/BODY/CRNG chunks into ImportedILBM payloads.
**Acceptance Criteria:**
- `parseChunks.ts` handles chunk iteration, big-endian parsing, and size validation.
- `decodeBitplanes.ts` converts 1–8 bitplanes to chunky indices; rejects HAM/ANIM/compressed formats with descriptive errors.
- `parseCRNG.ts` captures optional CRNG metadata arrays.
- Tests load fixture ILBM files verifying width, height, palette, cycles, and pixel data accuracy.

**Notes:**
- Implemented `parseChunks`/`decodeBitplanes`/`parseCRNG` plus `parseILBM` entrypoint that produces palette/pixels/cycles metadata.
- Bitplane decoder handles 1–8 planes, padding, and rejects compressed ILBM, providing descriptive errors.
- Tests synthesize a minimal ILBM buffer to confirm round-trip parsing.

## Story 06.04 – ImportIFFCommand Workflow _(Status: ✅ Completed)_
**Goal:** Integrate ILBM parser with the editor.
**Acceptance Criteria:**
- UI action selects ILBM file, runs parser, wraps result in `ImportIFFCommand` that replaces document buffers, palette, view (fit-to-screen), and pushes undo entry.
- Errors bubble to UI notifications with actionable messages (unsupported mode, corrupt chunk).
- Undo restores previous document entirely; redo reapplies import.

**Notes:**
- Implemented `ImportIFFCommand` plus `importIlbmFromFile`, which reads File buffers, runs `parseILBM`, and replaces document/palette/view state via undoable command.
- Errors are wrapped with “Failed to import ILBM” for display in future UI.
- Tests cover command undo/redo behavior and import helper error handling.
