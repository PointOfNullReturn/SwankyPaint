import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

const mockCanvasContext = (): CanvasRenderingContext2D =>
  ({
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
  }) as unknown as CanvasRenderingContext2D

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => mockCanvasContext())
