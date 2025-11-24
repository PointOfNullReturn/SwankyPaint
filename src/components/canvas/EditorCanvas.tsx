import { useEffect, useRef } from 'react'

import { registerToolShortcuts } from '../../canvas/keyboardShortcuts'
import { PointerDispatcher } from '../../canvas/pointerDispatcher'
import { getToolById } from '../../canvas/toolRegistry'
import { CanvasRenderer } from '../../rendering/renderer'
import { OverlayRenderer } from '../../rendering/overlayRenderer'
import { setOverlayRenderer } from '../../rendering/overlayManager'
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
    const overlayCanvas = overlayCanvasRef.current
    if (!canvas || !overlayCanvas) return
    const store = useEditorStore.getState()
    const renderer = new CanvasRenderer(canvas, { zoom: store.view.zoom })
    const overlayRenderer = new OverlayRenderer(overlayCanvas, store.view, store.view.zoom)
    setOverlayRenderer(overlayRenderer)
    const syncOverlaySize = () => {
      if (overlayCanvas.width !== canvas.width || overlayCanvas.height !== canvas.height) {
        overlayCanvas.width = canvas.width
        overlayCanvas.height = canvas.height
      }
    }

    const render = () => {
      const state = useEditorStore.getState()
      renderer.setZoom(state.view.zoom)
      renderer.setView(state.view)
      renderer.render(state.document)
      overlayRenderer.setView(state.view)
      overlayRenderer.setZoom(state.view.zoom)
      syncOverlaySize()
    }
    render()
    const unsubscribe = useEditorStore.subscribe(() => {
      render()
    })
    return () => {
      unsubscribe()
      setOverlayRenderer(null)
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
