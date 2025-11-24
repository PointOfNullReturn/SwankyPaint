import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Toolbar } from '../Toolbar'
import { resetEditorStore, useEditorStore } from '../../../state/store'

describe('Toolbar', () => {
  it('renders tool buttons and switches active tool', () => {
    resetEditorStore()
    render(<Toolbar />)
    const pencilButton = screen.getByRole('button', { name: /pencil/i })
    fireEvent.click(screen.getByRole('button', { name: /eraser/i }))
    expect(useEditorStore.getState().tool.activeToolId).toBe('eraser')
    expect(pencilButton).toHaveAttribute('aria-pressed', 'false')
  })
})
