import type {
  CRNGRange,
  DocumentState,
  PaletteColor,
  PaletteState,
  ViewState,
} from '../state/documentTypes'

export const PROJECT_VERSION = 1

export interface ProjectDocumentSnapshot {
  mode: DocumentState['mode']
  width: number
  height: number
  pixels: string
  palette?: PaletteColor[]
  cycles?: CRNGRange[]
}

export interface ProjectSnapshot {
  version: number
  document: ProjectDocumentSnapshot
  view: ViewState
  palette: Pick<PaletteState, 'foregroundIndex' | 'backgroundIndex'> & {
    colors?: PaletteColor[]
    cycles?: CRNGRange[]
  }
}

const encoder =
  typeof btoa === 'function'
    ? btoa
    : (data: string) => Buffer.from(data, 'binary').toString('base64')
const decoder =
  typeof atob === 'function'
    ? atob
    : (data: string) => Buffer.from(data, 'base64').toString('binary')

const toBinaryString = (bytes: Uint8Array): string => {
  let result = ''
  for (let i = 0; i < bytes.length; i += 1) {
    result += String.fromCharCode(bytes[i])
  }
  return result
}

export const encodeBase64 = (buffer: ArrayBufferLike): string =>
  encoder(toBinaryString(new Uint8Array(buffer)))

export const decodeBase64 = (data: string): Uint8Array => {
  const binary = decoder(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
