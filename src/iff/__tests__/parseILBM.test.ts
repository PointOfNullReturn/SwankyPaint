import { describe, expect, it } from 'vitest'

import { parseILBM } from '../parseILBM'

const createTestILBM = (): ArrayBuffer => {
  const width = 2
  const height = 2
  const bitplanes = 2
  const rowBytes = 2
  const bodySize = rowBytes * bitplanes * height
  const cmap = new Uint8Array([0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0, 0])
  const bmhd = new ArrayBuffer(20)
  const dv = new DataView(bmhd)
  dv.setUint16(0, width, false)
  dv.setUint16(2, height, false)
  dv.setUint8(8, bitplanes)
  dv.setUint8(10, 0)
  dv.setUint16(16, width, false)
  dv.setUint16(18, height, false)
  const body = new Uint8Array(bodySize)
  // simple pattern
  body.set([0b10000000, 0, 0b01000000, 0])
  const chunks = [
    ['BMHD', new Uint8Array(bmhd)],
    ['CMAP', cmap],
    ['BODY', body],
  ]
  let size = 12
  for (const [, data] of chunks) {
    size += 8 + data.length + (data.length % 2)
  }
  const buffer = new ArrayBuffer(size)
  const view = new DataView(buffer)
  const encoder = new TextEncoder()
  const form = encoder.encode('FORM')
  new Uint8Array(buffer, 0, 4).set(form)
  view.setUint32(4, size - 8, false)
  new Uint8Array(buffer, 8, 4).set(encoder.encode('ILBM'))
  let offset = 12
  for (const [id, data] of chunks) {
    new Uint8Array(buffer, offset, 4).set(encoder.encode(id))
    view.setUint32(offset + 4, data.length, false)
    new Uint8Array(buffer, offset + 8, data.length).set(data)
    offset += 8 + data.length + (data.length % 2)
  }
  return buffer
}

describe('parseILBM', () => {
  it('parses minimal ILBM file', () => {
    const buffer = createTestILBM()
    const ilbm = parseILBM(buffer)
    expect(ilbm.width).toBe(2)
    expect(ilbm.height).toBe(2)
    expect(ilbm.palette).toHaveLength(4)
    expect(ilbm.pixels).toHaveLength(4)
  })
})
