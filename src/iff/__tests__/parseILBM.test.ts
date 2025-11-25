import { describe, expect, it } from 'vitest'

import { parseILBM } from '../parseILBM'

const createTestILBM = ({
  compression = 0,
  bodyData,
}: {
  compression?: number
  bodyData?: Uint8Array
} = {}): ArrayBuffer => {
  const width = 2
  const height = 2
  const bitplanes = 2
  const rowBytes = 2
  const cmap = new Uint8Array([0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0, 0])
  const bmhd = new ArrayBuffer(20)
  const dv = new DataView(bmhd)
  dv.setUint16(0, width, false)
  dv.setUint16(2, height, false)
  dv.setUint8(8, bitplanes)
  dv.setUint8(10, compression)
  dv.setUint16(16, width, false)
  dv.setUint16(18, height, false)
  const defaultBody = new Uint8Array(rowBytes * bitplanes * height)
  defaultBody.set([0b10000000, 0, 0b01000000, 0])
  const body = bodyData ?? defaultBody
  const chunks: Array<[string, Uint8Array]> = [
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
    expect(Array.from(ilbm.pixels)).toEqual([1, 2, 0, 0])
  })

  it('parses ByteRun1 compressed ILBM file', () => {
    const literalRow = (values: number[]) => {
      const control = values.length - 1
      return Uint8Array.from([control, ...values])
    }
    const compressedRows = [
      literalRow([0b10000000, 0]),
      literalRow([0b01000000, 0]),
      literalRow([0, 0]),
      literalRow([0, 0]),
    ]
    const body = new Uint8Array(compressedRows.reduce((sum, row) => sum + row.length, 0))
    let offset = 0
    for (const row of compressedRows) {
      body.set(row, offset)
      offset += row.length
    }
    const buffer = createTestILBM({ compression: 1, bodyData: body })
    const ilbm = parseILBM(buffer)
    expect(ilbm.width).toBe(2)
    expect(ilbm.height).toBe(2)
    expect(Array.from(ilbm.pixels)).toEqual([1, 2, 0, 0])
  })
})
