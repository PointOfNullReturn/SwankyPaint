import { act, fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { EditorCanvas } from '../EditorCanvas'
import { resetEditorStore, useEditorStore } from '../../../state/store'

const renderSpy = vi.fn()
const zoomSpy = vi.fn()
const viewSpy = vi.fn()

vi.mock('../../../rendering/renderer', () => {
  const CanvasRendererMock = vi.fn(function CanvasRendererMock() {
    return {
      setZoom: zoomSpy,
      setView: viewSpy,
      render: renderSpy,
    }
  })
  return { CanvasRenderer: CanvasRendererMock }
})

vi.mock('../../../canvas/keyboardShortcuts', () => ({
  registerToolShortcuts: vi.fn(() => vi.fn()),
}))

const getState = () => useEditorStore.getState()

describe('EditorCanvas', () => {
  beforeEach(() => {
    resetEditorStore()
    renderSpy.mockClear()
    zoomSpy.mockClear()
    viewSpy.mockClear()
  })

  it('renders the document when the store changes', () => {
    render(<EditorCanvas />)
    expect(renderSpy).toHaveBeenCalled()
    act(() => {
      getState().setDocument((doc) => ({ ...doc }))
    })
    expect(renderSpy).toHaveBeenCalledTimes(2)
  })

  it('dispatches pointer events to active tools', () => {
    render(<EditorCanvas />)
    const canvas = document.querySelector('.canvas-base') as HTMLCanvasElement
    expect(canvas).toBeTruthy()
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 320,
      bottom: 200,
      width: 320,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => '',
    })
    act(() => {
      fireEvent.pointerDown(canvas, {
        clientX: 0,
        clientY: 0,
        button: 0,
        buttons: 1,
        pointerId: 1,
      })
      window.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 0, clientY: 0, button: 0, buttons: 0, pointerId: 1 }),
      )
    })
    const state = getState()
    const firstPixel = state.document.pixels[0]
    expect(firstPixel).toBe(state.palette.foregroundIndex)
  })
})
