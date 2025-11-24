import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

const mockCanvasContext = () => ({
  canvas: document.createElement('canvas'),
  imageSmoothingEnabled: false,
  createImageData: vi.fn((width: number, height: number) => ({
    data: new Uint8ClampedArray(width * height * 4),
    width,
    height,
  })),
  putImageData: vi.fn(),
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  strokeRect: vi.fn(),
})

if (!HTMLCanvasElement.prototype.getContext) {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext())
} else {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => mockCanvasContext())
}
