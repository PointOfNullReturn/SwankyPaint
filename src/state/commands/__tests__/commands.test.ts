import { afterEach, describe, expect, it } from 'vitest'

import { executeCommand, redoLastCommand, undoLastCommand } from '../Command'
import { ClearDocumentCommand } from '../ClearDocumentCommand'
import { ImportIFFCommand } from '../ImportIFFCommand'
import { resetEditorStore, useEditorStore } from '../../store'
import { PaletteChangeCommand } from '../PaletteChangeCommand'
import type { ZoomLevel } from '../../documentTypes'

const getStore = () => useEditorStore.getState()

afterEach(() => {
  resetEditorStore()
})

describe('command execution', () => {
  it('executes command and tracks undo history', () => {
    const command = new ClearDocumentCommand(getStore().document)

    executeCommand(command)

    const storeAfter = getStore()
    expect(storeAfter.history.undoStack).toHaveLength(1)
    expect(storeAfter.history.redoStack).toHaveLength(0)
    expect(storeAfter.document.pixels.every((value) => value === 0)).toBe(true)
  })

  it('undoes and redoes commands', () => {
    getStore().setDocument((doc) => {
      if (doc.mode !== 'indexed8') {
        return doc
      }
      return {
        ...doc,
        pixels: new Uint8Array(doc.pixels.map(() => 5)),
      }
    })

    const command = new ClearDocumentCommand(getStore().document)
    executeCommand(command)

    expect(getStore().history.undoStack).toHaveLength(1)

    const undone = undoLastCommand()
    expect(undone).toBe(command)
    expect(getStore().document.pixels[0]).toBe(5)
    expect(getStore().history.redoStack).toHaveLength(1)

    const redone = redoLastCommand()
    expect(redone).toBe(command)
    expect(getStore().document.pixels[0]).toBe(0)
    expect(getStore().history.undoStack).toHaveLength(1)
  })
})

describe('ImportIFFCommand', () => {
  it('replaces document and supports undo/redo', () => {
    const state = getStore()
    if (state.document.mode !== 'indexed8') {
      throw new Error('Expected indexed document for import test')
    }
    const next = {
      document: {
        mode: 'indexed8' as const,
        width: 4,
        height: 4,
        pixels: new Uint8Array(16),
        palette: state.document.palette.map((c) => ({ ...c })),
        cycles: [],
      },
      view: { ...state.view, zoom: 2 as ZoomLevel },
      palette: state.palette,
    }
    const command = new ImportIFFCommand(state, next)
    executeCommand(command)
    expect(getStore().document.width).toBe(4)
    undoLastCommand()
    expect(getStore().document.width).toBe(320)
    redoLastCommand()
    expect(getStore().document.width).toBe(4)
  })
})

describe('PaletteChangeCommand', () => {
  it('applies palette operations with undo/redo support', () => {
    const initialColors = getStore().palette.colors.map((color) => ({ ...color }))
    const command = new PaletteChangeCommand([
      { type: 'update', index: 0, color: { r: 10, g: 20, b: 30, a: 255 } },
      { type: 'insert', index: 1, color: { r: 5, g: 6, b: 7, a: 255 } },
      { type: 'remove', index: 3 },
    ])

    executeCommand(command)
    expect(getStore().palette.colors[0]).toEqual({ r: 10, g: 20, b: 30, a: 255 })
    expect(getStore().palette.colors).not.toEqual(initialColors)

    undoLastCommand()
    expect(getStore().palette.colors).toEqual(initialColors)

    redoLastCommand()
    expect(getStore().palette.colors[0]).toEqual({ r: 10, g: 20, b: 30, a: 255 })
  })

  it('updates CRNG cycles and restores them on undo', () => {
    const cycles = [{ rate: 2, low: 1, high: 3, active: true }]
    const command = new PaletteChangeCommand([{ type: 'setCycles', cycles }])
    executeCommand(command)
    expect(getStore().palette.cycles).toEqual(cycles)
    undoLastCommand()
    expect(getStore().palette.cycles).toEqual([])
  })
})
