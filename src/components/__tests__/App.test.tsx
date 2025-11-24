import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import App from '@/app/App'

describe('App', () => {
  it('renders shell layout', () => {
    render(<App />)
    expect(screen.getByLabelText(/application menu/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/canvas area/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/palette sidebar/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tools/i)).toBeInTheDocument()
  })
})
