import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { saveProject, serializeProject } from '../saveProject'
import { buildStateFromSnapshot, loadProject, parseProjectSnapshot } from '../loadProject'
import { resetEditorStore, useEditorStore } from '../../state/store'
import type { DocumentState } from '../../state/documentTypes'

const getState = () => useEditorStore.getState()

const createRgbaDocument = (): DocumentState => {
  const width = 4
  const height = 4
  const pixels = new Uint32Array(width * height)
  for (let i = 0; i < pixels.length; i += 1) {
    pixels[i] = 0xff0000ff
  }
  return {
    mode: 'rgba32',
    width,
    height,
    pixels,
  }
}

describe('project persistence', () => {
  beforeEach(() => {
    resetEditorStore()
  })

  afterEach(() => {
    resetEditorStore()
  })

  it('round trips indexed projects', () => {
    const initial = saveProject(getState().document, getState().view, getState().palette)
    getState().setForegroundIndex(5)
    loadProject(initial)
    expect(getState().document.width).toBe(initial.document.width)
    expect(getState().palette.foregroundIndex).toBe(initial.palette.foregroundIndex)
    expect(getState().history.undoStack).toHaveLength(1)
  })

  it('supports RGBA documents', () => {
    const rgbaDoc = createRgbaDocument()
    getState().setDocument(rgbaDoc)
    const snapshotString = serializeProject(getState())
    getState().setDocument(createRgbaDocument())
    loadProject(snapshotString)
    const state = getState()
    expect(state.document.mode).toBe('rgba32')
    expect(state.document.pixels[0]).toBe(0xff0000ff)
  })

  it('validates snapshot shape', () => {
    const snapshot = saveProject(getState().document, getState().view, getState().palette)
    const invalid = { ...snapshot, document: { ...snapshot.document, width: 0 } }
    expect(() => buildStateFromSnapshot(parseProjectSnapshot(invalid))).toThrow(/dimensions/i)
  })
})
