import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Menubar } from '../Menubar'
import { resetEditorStore } from '../../../state/store'

describe('Menubar', () => {
  it('opens help menu and shows about modal', async () => {
    resetEditorStore()
    render(<Menubar />)

    // Open Help menu
    fireEvent.click(screen.getByRole('button', { name: /help/i }))

    // Click About menu item
    fireEvent.click(screen.getByRole('menuitem', { name: /about/i }))

    // Verify dialog is shown
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('open')

    // Verify dialog can be closed
    const closeButton = within(dialog).getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    // Dialog should be closed (no longer have 'open' attribute)
    await waitFor(() => {
      expect(dialog).not.toHaveAttribute('open')
    })
  })

  it('toggles cycle animation from the view menu', () => {
    resetEditorStore()
    render(<Menubar />)
    const viewButton = screen.getByRole('button', { name: /view/i })
    fireEvent.click(viewButton)
    fireEvent.click(screen.getByRole('menuitem', { name: /enable cycling/i }))
    fireEvent.click(viewButton) // reopen to read updated label
    expect(screen.getByRole('menuitem', { name: /disable cycling/i })).toBeInTheDocument()
  })
})
