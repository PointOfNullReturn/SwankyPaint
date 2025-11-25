import type { Tool } from '../Tool'
import type { EditorStoreState } from '../../state/store'
import { drawLine } from './drawHelpers'
import { executeCommand, nextCommandId } from '../../state/commands/Command'
import type { Command } from '../../state/commands/Command'
import { getPointerColor } from './colorSelection'
import { withOverlayRenderer } from '../../rendering/overlayManager'

class LineCommand implements Command {
  readonly id: string
  readonly createdAt: number
  readonly label = 'Line'
  private readonly beforeIndexed?: Uint8Array
  private readonly beforeRgba?: Uint32Array
  private readonly start: [number, number]
  private readonly end: [number, number]
  private readonly value: number
  private readonly isIndexed: boolean

  constructor(
    document: EditorStoreState['document'],
    start: [number, number],
    end: [number, number],
    value: number,
  ) {
    this.id = nextCommandId('line')
    this.createdAt = Date.now()
    this.start = start
    this.end = end
    this.value = value
    this.isIndexed = document.mode === 'indexed8'
    if (document.mode === 'indexed8') {
      this.beforeIndexed = new Uint8Array(document.pixels)
    } else {
      this.beforeRgba = new Uint32Array(document.pixels)
    }
  }

  do(state: EditorStoreState): void {
    drawLine(state.document, this.start[0], this.start[1], this.end[0], this.end[1], this.value)
  }

  undo(state: EditorStoreState): void {
    const document = state.document
    if (this.isIndexed && document.mode === 'indexed8' && this.beforeIndexed) {
      state.setDocument({ ...document, pixels: new Uint8Array(this.beforeIndexed) })
      return
    }
    if (!this.isIndexed && document.mode === 'rgba32' && this.beforeRgba) {
      state.setDocument({ ...document, pixels: new Uint32Array(this.beforeRgba) })
    }
  }
}

export class LineTool implements Tool {
  id = 'line'
  private start: [number, number] | null = null
  private drawValue = 1

  onPointerDown(state: EditorStoreState, x: number, y: number, evt: PointerEvent): void {
    this.start = [x, y]
    this.drawValue = getPointerColor(state, evt)
    withOverlayRenderer((overlay) => {
      overlay.drawLine(x, y, x, y)
    })
  }

  onPointerMove(_state: EditorStoreState, x: number, y: number, _evt: PointerEvent): void {
    void _state
    void _evt
    if (!this.start) return
    const [startX, startY] = this.start
    withOverlayRenderer((overlay) => {
      overlay.drawLine(startX, startY, x, y)
    })
  }

  onPointerUp(state: EditorStoreState, x: number, y: number, _evt: PointerEvent): void {
    void _evt
    if (!this.start) return
    const command = new LineCommand(state.document, this.start, [x, y], this.drawValue)
    command.do(state)
    executeCommand(command, { skipDo: true })
    withOverlayRenderer((overlay) => {
      overlay.clear()
    })
    this.start = null
  }

  onCancel(): void {
    this.start = null
    withOverlayRenderer((overlay) => {
      overlay.clear()
    })
  }
}
