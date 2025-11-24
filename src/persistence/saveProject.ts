import type { DocumentState, PaletteState, ViewState } from '../state/documentTypes'
import { encodeBase64, PROJECT_VERSION, type ProjectSnapshot } from './projectSchema'
import type { EditorStoreState } from '../state/store'

const clonePalette = (colors: PaletteState['colors']): PaletteState['colors'] =>
  colors.map((color) => ({ ...color }))

export const saveProject = (
  document: DocumentState,
  view: ViewState,
  palette: PaletteState,
): ProjectSnapshot => {
  const pixels =
    document.mode === 'indexed8'
      ? encodeBase64(new Uint8Array(document.pixels))
      : encodeBase64(new Uint8Array(document.pixels.buffer))

  return {
    version: PROJECT_VERSION,
    document: {
      mode: document.mode,
      width: document.width,
      height: document.height,
      pixels,
      palette: document.mode === 'indexed8' ? document.palette.map((color) => ({ ...color })) : undefined,
      cycles: document.mode === 'indexed8' ? document.cycles?.map((cycle) => ({ ...cycle })) : undefined,
    },
    view: { ...view },
    palette: {
      foregroundIndex: palette.foregroundIndex,
      backgroundIndex: palette.backgroundIndex,
      colors: clonePalette(palette.colors),
      cycles: palette.cycles?.map((cycle) => ({ ...cycle })),
    },
  }
}

export const serializeProject = (state: EditorStoreState): string =>
  JSON.stringify(saveProject(state.document, state.view, state.palette))
