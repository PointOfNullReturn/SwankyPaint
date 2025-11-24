export interface BitmapHeader {
  width: number
  height: number
  bitplanes: number
  masking: number
  compression: number
  transparentColor: number
  xAspect: number
  yAspect: number
  pageWidth: number
  pageHeight: number
}

export interface ILBMChunks {
  header: BitmapHeader
  palette: Uint8Array
  body: Uint8Array
  crng?: Uint8Array
}

export interface ImportedILBM {
  width: number
  height: number
  pixels: Uint8Array
  palette: Array<{ r: number; g: number; b: number; a: number }>
  cycles?: Array<{ rate: number; low: number; high: number; active: boolean }>
}
