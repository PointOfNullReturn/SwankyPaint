import { useEffect, useRef } from 'react'

import { registerToolShortcuts } from '../../canvas/keyboardShortcuts'
import { PointerDispatcher } from '../../canvas/pointerDispatcher'
import { getToolById } from '../../canvas/toolRegistry'
import { CanvasRenderer } from '../../rendering/renderer'
import { useEditorStore } from '../../state/store'

export const EditorCanvas = () => {
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const disposeShortcuts = registerToolShortcuts()
    return disposeShortcuts
  }, [])

  useEffect(() => {
    const canvas = baseCanvasRef.current
    if (!canvas) return
    const renderer = new CanvasRenderer(canvas, { zoom: useEditorStore.getState().view.zoom })
    const render = () => {
      const state = useEditorStore.getState()
      renderer.setZoom(state.view.zoom)
      renderer.setView(state.view)
      renderer.render(state.document)
      const overlay = overlayCanvasRef.current
      if (overlay) {
        overlay.width = canvas.width
        overlay.height = canvas.height
      }
    }
    render()
    const unsubscribe = useEditorStore.subscribe(() => {
      render()
    })
    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const canvas = baseCanvasRef.current
    if (!canvas) return
    const dispatcher = new PointerDispatcher({
      canvas,
      getActiveTool: () => {
        const toolId = useEditorStore.getState().tool.activeToolId
        return getToolById(toolId)
      },
    })
    dispatcher.bind()
    return () => dispatcher.dispose()
  }, [])

  return (
    <div className="canvas-stack">
      <canvas ref={baseCanvasRef} className="canvas-base" />
      <canvas ref={overlayCanvasRef} className="canvas-overlay" />
    </div>
  )
}
