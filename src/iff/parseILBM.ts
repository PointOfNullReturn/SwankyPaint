import { parseChunks } from './parseChunks'
import { decodeBitplanes } from './decodeBitplanes'
import { parseCRNG } from './parseCRNG'
import type { ImportedILBM } from './types'

export const parseILBM = (buffer: ArrayBuffer): ImportedILBM => {
  const { header, palette, body, crng } = parseChunks(buffer)
  const pixels = decodeBitplanes(header, body)
  const colors = []
  for (let i = 0; i < palette.length; i += 3) {
    colors.push({ r: palette[i], g: palette[i + 1], b: palette[i + 2], a: 255 })
  }
  const result: ImportedILBM = {
    width: header.width,
    height: header.height,
    pixels,
    palette: colors,
  }
  if (crng) {
    result.cycles = parseCRNG(crng)
  }
  return result
}
