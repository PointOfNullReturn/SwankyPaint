import { OverlayRenderer } from './overlayRenderer'

let renderer: OverlayRenderer | null = null

export const setOverlayRenderer = (next: OverlayRenderer | null): void => {
  renderer = next
}

export const getOverlayRenderer = (): OverlayRenderer | null => renderer

export const withOverlayRenderer = (fn: (overlay: OverlayRenderer) => void): void => {
  if (renderer) {
    fn(renderer)
  }
}
