import type { BitmapHeader } from './types'

const readByteRunRow = (
  source: Uint8Array,
  startOffset: number,
  rowBytes: number,
): { data: Uint8Array; nextOffset: number } => {
  const row = new Uint8Array(rowBytes)
  let writeOffset = 0
  let readOffset = startOffset

  while (writeOffset < rowBytes) {
    if (readOffset >= source.length) {
      throw new Error('Unexpected end of ILBM BODY while decoding compression')
    }
    let control = source[readOffset++]
    control = control > 127 ? control - 256 : control
    if (control >= 0) {
      const literalLength = control + 1
      if (writeOffset + literalLength > rowBytes) {
        throw new Error('Decoded ILBM row exceeds expected length')
      }
      if (readOffset + literalLength > source.length) {
        throw new Error('Unexpected end of ILBM BODY while decoding literals')
      }
      row.set(source.subarray(readOffset, readOffset + literalLength), writeOffset)
      readOffset += literalLength
      writeOffset += literalLength
    } else if (control >= -127) {
      const runLength = -control + 1
      if (writeOffset + runLength > rowBytes) {
        throw new Error('Decoded ILBM row exceeds expected length')
      }
      if (readOffset >= source.length) {
        throw new Error('Unexpected end of ILBM BODY while decoding runs')
      }
      const value = source[readOffset++]
      row.fill(value, writeOffset, writeOffset + runLength)
      writeOffset += runLength
    } else {
      // control === -128 indicates NOP
    }
  }

  return { data: row, nextOffset: readOffset }
}

const writePlaneRow = (
  planeData: Uint8Array,
  output: Uint8Array,
  rowStart: number,
  plane: number,
  width: number,
): void => {
  for (let x = 0; x < width; x += 8) {
    const byte = planeData[x >> 3]
    for (let bit = 0; bit < 8 && x + bit < width; bit += 1) {
      const mask = 1 << (7 - bit)
      if (byte & mask) {
        output[rowStart + x + bit] |= 1 << plane
      }
    }
  }
}

export const decodeBitplanes = (header: BitmapHeader, body: Uint8Array): Uint8Array => {
  const width = header.width
  const height = header.height
  const planes = header.bitplanes
  if (planes < 1 || planes > 8) {
    throw new Error(`Unsupported bitplane count ${planes}`)
  }
  const rowBytes = ((width + 15) >> 4) << 1
  const output = new Uint8Array(width * height)

  if (header.compression === 0) {
    let bodyOffset = 0
    for (let y = 0; y < height; y += 1) {
      const rowStart = y * width
      for (let plane = 0; plane < planes; plane += 1) {
        const planeOffset = bodyOffset + plane * rowBytes
        if (planeOffset + rowBytes > body.length) {
          throw new Error('Unexpected end of ILBM BODY data')
        }
        const planeData = body.subarray(planeOffset, planeOffset + rowBytes)
        writePlaneRow(planeData, output, rowStart, plane, width)
      }
      bodyOffset += planes * rowBytes
    }
    return output
  }

  if (header.compression === 1) {
    let bodyOffset = 0
    for (let y = 0; y < height; y += 1) {
      const rowStart = y * width
      for (let plane = 0; plane < planes; plane += 1) {
        const { data, nextOffset } = readByteRunRow(body, bodyOffset, rowBytes)
        bodyOffset = nextOffset
        writePlaneRow(data, output, rowStart, plane, width)
      }
    }
    return output
  }

  throw new Error(`Unsupported ILBM compression ${header.compression}`)
}
