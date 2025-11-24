import { describe, expect, it, vi } from 'vitest'

import { importIlbmFromFile } from '../importIlbm'
import { parseILBM } from '../parseILBM'

vi.mock('../parseILBM', () => ({
  parseILBM: vi.fn(),
}))

describe('importIlbmFromFile', () => {
  it('parses file and executes command', async () => {
    const pixels = new Uint8Array([0, 1, 2, 3])
    ;(parseILBM as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      width: 2,
      height: 2,
      pixels,
      palette: [
        { r: 0, g: 0, b: 0, a: 255 },
        { r: 255, g: 255, b: 255, a: 255 },
      ],
      cycles: [],
    })
    const file = new File([new ArrayBuffer(8)], 'test.ilbm')
    if (!('arrayBuffer' in file)) {
      ;(file as File & { arrayBuffer?: () => Promise<ArrayBuffer> }).arrayBuffer = () =>
        Promise.resolve(new ArrayBuffer(8))
    }
    await importIlbmFromFile(file)
    expect(parseILBM).toHaveBeenCalled()
  })

  it('throws descriptive error on failure', async () => {
    ;(parseILBM as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('bad data')
    })
    const file = new File([new ArrayBuffer(8)], 'bad.ilbm')
    if (!('arrayBuffer' in file)) {
      ;(file as File & { arrayBuffer?: () => Promise<ArrayBuffer> }).arrayBuffer = () =>
        Promise.resolve(new ArrayBuffer(8))
    }
    await expect(importIlbmFromFile(file)).rejects.toThrow(/Failed to import ILBM/)
  })
})
