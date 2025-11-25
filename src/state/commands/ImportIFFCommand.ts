import type { Command } from './Command'
import type { DocumentState, PaletteState, ViewState } from '../documentTypes'
import type { EditorStoreState } from '../store'

const cloneDocument = (document: DocumentState): DocumentState => {
  if (document.mode === 'indexed8') {
    return {
      mode: 'indexed8',
      width: document.width,
      height: document.height,
      pixels: new Uint8Array(document.pixels),
      palette: document.palette.map((color) => ({ ...color })),
      cycles: document.cycles?.map((cycle) => ({ ...cycle })) ?? [],
    }
  }
  return {
    mode: 'rgba32',
    width: document.width,
    height: document.height,
    pixels: new Uint32Array(document.pixels),
  }
}

const clonePalette = (palette: PaletteState): PaletteState => ({
  colors: palette.colors.map((color) => ({ ...color })),
  foregroundIndex: palette.foregroundIndex,
  backgroundIndex: palette.backgroundIndex,
  cycles: palette.cycles?.map((cycle) => ({ ...cycle })) ?? [],
})

export class ImportIFFCommand implements Command {
  readonly id: string
  readonly createdAt: number
  readonly label = 'Import ILBM'
  private readonly beforeDocument: DocumentState
  private readonly beforeView: ViewState
  private readonly beforePalette: PaletteState
  private readonly afterDocument: DocumentState
  private readonly afterView: ViewState
  private readonly afterPalette: PaletteState

  constructor(
    current: EditorStoreState,
    next: { document: DocumentState; view: ViewState; palette: PaletteState },
  ) {
    this.id = `import-iff-${String(Date.now())}`
    this.createdAt = Date.now()
    this.beforeDocument = cloneDocument(current.document)
    this.beforeView = { ...current.view }
    this.beforePalette = clonePalette(current.palette)
    this.afterDocument = cloneDocument(next.document)
    this.afterView = { ...next.view }
    this.afterPalette = clonePalette(next.palette)
  }

  do(state: EditorStoreState): void {
    this.applyState(state, this.afterDocument, this.afterView, this.afterPalette)
  }

  undo(state: EditorStoreState): void {
    this.applyState(state, this.beforeDocument, this.beforeView, this.beforePalette)
  }

  private applyState(
    state: EditorStoreState,
    document: DocumentState,
    view: ViewState,
    palette: PaletteState,
  ): void {
    state.setDocument(cloneDocument(document))
    state.updateView(() => ({ ...view }))
    state.setPaletteColors(palette.colors.map((color) => ({ ...color })))
    state.setPaletteCycles(palette.cycles ? palette.cycles.map((cycle) => ({ ...cycle })) : [])
    state.setForegroundIndex(palette.foregroundIndex)
    state.setBackgroundIndex(palette.backgroundIndex)
  }
}
