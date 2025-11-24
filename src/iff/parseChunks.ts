import type { ILBMChunks, BitmapHeader } from './types'

const readUint16BE = (view: DataView, offset: number): number => view.getUint16(offset, false)
const readUint32BE = (view: DataView, offset: number): number => view.getUint32(offset, false)

export const parseChunks = (buffer: ArrayBuffer): ILBMChunks => {
  const view = new DataView(buffer)
  const textDecoder = new TextDecoder('ascii')
  const form = textDecoder.decode(buffer.slice(0, 4))
  if (form !== 'FORM') {
    throw new Error('Not an IFF FORM file')
  }
  const type = textDecoder.decode(buffer.slice(8, 12))
  if (type !== 'ILBM') {
    throw new Error(`Unsupported FORM type ${type}`)
  }
  let offset = 12
  let header: BitmapHeader | null = null
  let palette: Uint8Array | null = null
  let body: Uint8Array | null = null
  let crng: Uint8Array | undefined

  while (offset + 8 <= buffer.byteLength) {
    const chunkId = textDecoder.decode(buffer.slice(offset, offset + 4))
    const chunkSize = readUint32BE(view, offset + 4)
    const chunkDataStart = offset + 8
    const chunkDataEnd = chunkDataStart + chunkSize
    const chunkData = buffer.slice(chunkDataStart, chunkDataEnd)
    switch (chunkId) {
      case 'BMHD': {
        const dv = new DataView(chunkData)
        header = {
          width: readUint16BE(dv, 0),
          height: readUint16BE(dv, 2),
          bitplanes: dv.getUint8(8),
          masking: dv.getUint8(9),
          compression: dv.getUint8(10),
          transparentColor: readUint16BE(dv, 12),
          xAspect: dv.getUint8(14),
          yAspect: dv.getUint8(15),
          pageWidth: readUint16BE(dv, 16),
          pageHeight: readUint16BE(dv, 18),
        }
        break
      }
      case 'CMAP':
        palette = new Uint8Array(chunkData)
        break
      case 'BODY':
        body = new Uint8Array(chunkData)
        break
      case 'CRNG':
        crng = new Uint8Array(chunkData)
        break
      default:
        break
    }
    offset = chunkDataEnd + (chunkSize % 2)
  }

  if (!header || !palette || !body) {
    throw new Error('Missing ILBM chunks (BMHD/CMAP/BODY required)')
  }
  return { header, palette, body, crng }
}
