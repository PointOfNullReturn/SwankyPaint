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

const clonePaletteState = (palette: PaletteState): PaletteState => ({
  colors: palette.colors.map((color) => ({ ...color })),
  foregroundIndex: palette.foregroundIndex,
  backgroundIndex: palette.backgroundIndex,
  cycles: palette.cycles?.map((cycle) => ({ ...cycle })) ?? [],
})

export class LoadProjectCommand implements Command {
  readonly id: string
  readonly createdAt: number
  readonly label = 'Load project'
  private readonly nextDocument: DocumentState
  private readonly nextView: ViewState
  private readonly nextPalette: PaletteState
  private readonly previousDocument: DocumentState
  private readonly previousView: ViewState
  private readonly previousPalette: PaletteState

  constructor(current: EditorStoreState, next: { document: DocumentState; view: ViewState; palette: PaletteState }) {
    this.id = `load-${Date.now()}`
    this.createdAt = Date.now()
    this.nextDocument = cloneDocument(next.document)
    this.nextView = { ...next.view }
    this.nextPalette = clonePaletteState(next.palette)
    this.previousDocument = cloneDocument(current.document)
    this.previousView = { ...current.view }
    this.previousPalette = clonePaletteState(current.palette)
  }

  do(state: EditorStoreState): void {
    this.applyState(state, this.nextDocument, this.nextView, this.nextPalette)
  }

  undo(state: EditorStoreState): void {
    this.applyState(state, this.previousDocument, this.previousView, this.previousPalette)
  }

  private applyState(state: EditorStoreState, document: DocumentState, view: ViewState, palette: PaletteState) {
    state.setDocument(cloneDocument(document))
    state.updateView(() => ({ ...view }))
    state.setPaletteColors(palette.colors.map((color) => ({ ...color })))
    state.setPaletteCycles(palette.cycles ? palette.cycles.map((cycle) => ({ ...cycle })) : [])
    state.setForegroundIndex(palette.foregroundIndex)
    state.setBackgroundIndex(palette.backgroundIndex)
  }
}
