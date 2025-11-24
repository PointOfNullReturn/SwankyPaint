import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Menubar } from '../Menubar'
import { resetEditorStore } from '../../../state/store'

describe('Menubar', () => {
  it('opens help menu and shows about modal', () => {
    resetEditorStore()
    render(<Menubar />)
    fireEvent.click(screen.getByRole('button', { name: /help/i }))
    fireEvent.click(screen.getByRole('button', { name: /about/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
