import { useEditorStore, type EditorStoreState } from '../../state/store'
import { useShallow } from 'zustand/react/shallow'

import '../../styles/status/StatusBar.css'

const toHex = (value: number): string => value.toString(16).padStart(2, '0')

const colorToHex = (color: { r: number; g: number; b: number }): string =>
  `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase()

const selectPaletteStatus = (state: EditorStoreState) => {
  const fgIndex = state.palette.foregroundIndex
  const bgIndex = state.palette.backgroundIndex
  const fgColor = state.palette.colors[fgIndex] ?? state.palette.colors[0]
  const bgColor = state.palette.colors[bgIndex] ?? state.palette.colors[0]
  return {
    fgIndex,
    bgIndex,
    fgHex: colorToHex(fgColor),
    bgHex: colorToHex(bgColor),
  }
}

const selectPointerStatus = (state: EditorStoreState) => ({
  x: state.pointer.lastX,
  y: state.pointer.lastY,
})

const selectHistoryStatus = (state: EditorStoreState) => ({
  undoAvailable: state.history.undoStack.length > 0,
  redoAvailable: state.history.redoStack.length > 0,
})

export const StatusBar = () => {
  const { fgIndex, bgIndex, fgHex, bgHex } = useEditorStore(useShallow(selectPaletteStatus))
  const { x, y } = useEditorStore(useShallow(selectPointerStatus))
  const { undoAvailable, redoAvailable } = useEditorStore(useShallow(selectHistoryStatus))

  return (
    <footer className="status-bar" aria-label="Status bar">
      <div className="status-bar__item" aria-live="polite">
        <span className="status-label">FG</span>
        <strong>{`#${fgIndex.toString().padStart(3, '0')}`}</strong>
        <span>{fgHex}</span>
      </div>
      <div className="status-bar__item" aria-live="polite">
        <span className="status-label">BG</span>
        <strong>{`#${bgIndex.toString().padStart(3, '0')}`}</strong>
        <span>{bgHex}</span>
      </div>
      <div className="status-bar__item" aria-live="polite">
        <span className="status-label">Pos</span>
        <span>{`X: ${Math.round(x)}`}</span>
        <span>{`Y: ${Math.round(y)}`}</span>
      </div>
      <div className="status-bar__item" aria-live="polite">
        <span className="status-label">Undo</span>
        <span className={undoAvailable ? 'status-available' : 'status-disabled'}>
          {undoAvailable ? 'Available' : 'None'}
        </span>
        <span className="status-label">Redo</span>
        <span className={redoAvailable ? 'status-available' : 'status-disabled'}>
          {redoAvailable ? 'Available' : 'None'}
        </span>
      </div>
    </footer>
  )
}
