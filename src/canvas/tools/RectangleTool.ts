import type { Tool } from '../Tool'
import type { EditorStoreState } from '../../state/store'
import { drawLine } from './drawHelpers'
import { executeCommand, nextCommandId } from '../../state/commands/Command'
import type { Command } from '../../state/commands/Command'
import { getPointerColor } from './colorSelection'
import { withOverlayRenderer } from '../../rendering/overlayManager'

class RectangleCommand implements Command {
  readonly id: string
  readonly createdAt: number
  readonly label = 'Rectangle'
  private readonly beforeIndexed?: Uint8Array
  private readonly beforeRgba?: Uint32Array
  private readonly start: [number, number]
  private readonly end: [number, number]
  private readonly value: number
  private readonly filled: boolean
  private readonly isIndexed: boolean

  constructor(
    document: EditorStoreState['document'],
    start: [number, number],
    end: [number, number],
    value: number,
    filled: boolean,
  ) {
    this.id = nextCommandId('rect')
    this.createdAt = Date.now()
    this.start = start
    this.end = end
    this.value = value
    this.filled = filled
    this.isIndexed = document.mode === 'indexed8'
    if (document.mode === 'indexed8') {
      this.beforeIndexed = new Uint8Array(document.pixels)
    } else {
      this.beforeRgba = new Uint32Array(document.pixels)
    }
  }

  do(state: EditorStoreState): void {
    const [x0, y0] = this.start
    const [x1, y1] = this.end
    if (this.filled) {
      const minX = Math.min(x0, x1)
      const maxX = Math.max(x0, x1)
      const minY = Math.min(y0, y1)
      const maxY = Math.max(y0, y1)
      for (let y = minY; y <= maxY; y += 1) {
        drawLine(state.document, minX, y, maxX, y, this.value)
      }
      return
    }
    drawLine(state.document, x0, y0, x1, y0, this.value)
    drawLine(state.document, x1, y0, x1, y1, this.value)
    drawLine(state.document, x1, y1, x0, y1, this.value)
    drawLine(state.document, x0, y1, x0, y0, this.value)
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

export class RectangleTool implements Tool {
  id = 'rectangle'
  private start: [number, number] | null = null
  private drawValue = 1

  onPointerDown(state: EditorStoreState, x: number, y: number, evt: PointerEvent): void {
    this.start = [x, y]
    this.drawValue = getPointerColor(state, evt)
    withOverlayRenderer((overlay) => {
      overlay.drawRect(x, y, 1, 1)
    })
  }

  onPointerMove(_state: EditorStoreState, x: number, y: number, _evt: PointerEvent): void {
    void _state
    void _evt
    if (!this.start) return
    const [startX, startY] = this.start
    const minX = Math.min(startX, x)
    const minY = Math.min(startY, y)
    const width = Math.abs(startX - x) + 1
    const height = Math.abs(startY - y) + 1
    withOverlayRenderer((overlay) => {
      overlay.drawRect(minX, minY, width, height)
    })
  }

  onPointerUp(state: EditorStoreState, x: number, y: number, _evt: PointerEvent): void {
    void _evt
    if (!this.start) return
    const command = new RectangleCommand(
      state.document,
      this.start,
      [x, y],
      this.drawValue,
      state.tool.rectangleFilled,
    )
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
