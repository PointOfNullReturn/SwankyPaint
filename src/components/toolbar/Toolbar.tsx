import { useEditorStore } from '../../state/store'

import '../../styles/layout/Toolbar.css'

const tools = () => [
  { id: 'pencil', label: 'Pencil', shortcut: 'B', icon: PencilIcon },
  { id: 'eraser', label: 'Eraser', shortcut: 'E', icon: EraserIcon },
  { id: 'line', label: 'Line', shortcut: 'L', icon: LineIcon },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: RectangleIcon },
  { id: 'fill', label: 'Fill', shortcut: 'F', icon: FillIcon },
  { id: 'picker', label: 'Picker', shortcut: 'I', icon: PickerIcon },
]

export const Toolbar = () => {
  const activeTool = useEditorStore((state) => state.tool.activeToolId)
  const setTool = useEditorStore((state) => state.setTool)
  return (
    <div className="toolbar">
      {tools().map(({ id, label, icon: Icon, shortcut }) => (
        <button
          key={id}
          type="button"
          aria-pressed={activeTool === id}
          className={`toolbar-button${activeTool === id ? ' is-active' : ''}`}
          onClick={() => {
            setTool(id)
          }}
          title={`${label} (${shortcut})`}
        >
          <Icon />
          <span className="toolbar-button-label">
            {label}
            <small>{shortcut}</small>
          </span>
        </button>
      ))}
    </div>
  )
}

const PencilIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 17l4 4 14-14-4-4z" fill="#fafafa" stroke="#1a1a1a" strokeWidth="1" />
  </svg>
)

const EraserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="8" width="14" height="8" fill="#d0d0d0" stroke="#1a1a1a" />
  </svg>
)

const LineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <line x1="4" y1="20" x2="20" y2="4" stroke="#fafafa" strokeWidth="2" />
  </svg>
)

const RectangleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="6" width="16" height="12" fill="none" stroke="#fafafa" strokeWidth="2" />
  </svg>
)

const FillIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 3l-4 4 8 8 4-4z" fill="#fafafa" stroke="#1a1a1a" />
    <circle cx="18" cy="18" r="3" fill="#00bcd4" />
  </svg>
)

const PickerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12l7-7 4 4-7 7-4 1z" fill="#fafafa" stroke="#1a1a1a" />
  </svg>
)
