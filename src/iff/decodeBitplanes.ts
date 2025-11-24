import type { BitmapHeader } from './types'

export const decodeBitplanes = (header: BitmapHeader, body: Uint8Array): Uint8Array => {
  if (header.compression !== 0) {
    throw new Error('Compressed ILBM not supported')
  }
  const width = header.width
  const height = header.height
  const planes = header.bitplanes
  if (planes < 1 || planes > 8) {
    throw new Error(`Unsupported bitplane count ${planes}`)
  }
  const rowBytes = ((width + 15) >> 4) << 1
  const output = new Uint8Array(width * height)
  let bodyOffset = 0
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * width
    for (let plane = 0; plane < planes; plane += 1) {
      const planeOffset = bodyOffset + plane * rowBytes
      for (let x = 0; x < width; x += 8) {
        const byte = body[planeOffset + (x >> 3)]
        for (let bit = 0; bit < 8 && x + bit < width; bit += 1) {
          const mask = 1 << (7 - bit)
          if (byte & mask) {
            output[rowStart + x + bit] |= 1 << plane
          }
        }
      }
    }
    bodyOffset += planes * rowBytes
  }
  return output
}
