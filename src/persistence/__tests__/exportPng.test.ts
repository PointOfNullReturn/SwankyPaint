import { beforeEach, describe, expect, it, vi } from 'vitest'

import { documentToRgba, exportCurrentDocumentToPng } from '../exportPng'
import { resetEditorStore, useEditorStore } from '../../state/store'

const getState = () => useEditorStore.getState()

describe('exportPng', () => {
  beforeEach(() => {
    resetEditorStore()
    ;(globalThis as unknown as { ImageData?: typeof ImageData }).ImageData = class MockImageData {
      data: Uint8ClampedArray
      width: number
      height: number
      constructor(data: Uint8ClampedArray, width: number, height: number) {
        this.data = data
        this.width = width
        this.height = height
      }
    } as typeof ImageData
  })

  it('converts indexed documents to RGBA buffers', () => {
    const doc = getState().document
    if (doc.mode !== 'indexed8') {
      throw new Error('Expected default indexed document')
    }
    doc.pixels[0] = 2
    const rgba = documentToRgba(doc)
    expect(rgba[0]).toBe(doc.palette[2].r)
  })

  it('exports via canvas toBlob', async () => {
    const canvasMock = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({ putImageData: vi.fn() }),
      toBlob: vi.fn((cb) => cb(new Blob(['png']))),
    }
    const anchorMock = {
      click: vi.fn(),
      set href(value: string) {
        this._href = value
      },
      set download(value: string) {
        this._download = value
      },
    }
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementationOnce(() => canvasMock as never)
      .mockImplementationOnce(() => anchorMock as never)
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const blob = await exportCurrentDocumentToPng()
    expect(blob).toBeInstanceOf(Blob)
    expect(canvasMock.getContext).toHaveBeenCalledWith('2d')
    expect(anchorMock.click).toHaveBeenCalled()
    expect(createUrlSpy).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalled()
    createElementSpy.mockRestore()
    createUrlSpy.mockRestore()
    revokeSpy.mockRestore()
  })
})
