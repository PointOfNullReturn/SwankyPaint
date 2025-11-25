import { describe, expect, it } from 'vitest'

import { documentToScreen, screenToDocument } from '../pointerTransforms'
import type { ViewState } from '../../state/documentTypes'

const view: ViewState = {
  zoom: 4,
  offsetX: 10,
  offsetY: 5,
  showGrid: false,
  cycleAnimationEnabled: false,
}

describe('pointer transforms', () => {
  it('converts screen to document coordinates respecting zoom and pan', () => {
    const docPoint = screenToDocument({ x: 40, y: 20 }, view, 4, 320, 200)
    expect(docPoint).toEqual({ x: 20, y: 10 })
  })

  it('clamps within document bounds', () => {
    const docPoint = screenToDocument({ x: -1000, y: -1000 }, view, 4, 320, 200)
    expect(docPoint).toEqual({ x: 0, y: 0 })
  })

  it('converts document to screen coordinates', () => {
    const screenPoint = documentToScreen({ x: 20, y: 10 }, view, 4)
    expect(screenPoint).toEqual({ x: 40, y: 20 })
  })
})
