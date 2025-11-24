import type { CRNGRange } from '../state/documentTypes'

export const parseCRNG = (data: Uint8Array): CRNGRange[] => {
  const ranges: CRNGRange[] = []
  for (let offset = 0; offset + 8 <= data.length; offset += 8) {
    const rate = data[offset + 1]
    const low = data[offset + 2]
    const high = data[offset + 3]
    const active = data[offset + 4] !== 0
    ranges.push({ rate, low, high, active })
  }
  return ranges
}
