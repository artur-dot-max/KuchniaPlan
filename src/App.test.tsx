import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { App } from './App'

describe('App', () => {
  it('renders the operational today screen', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Dzisiaj' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dodaj zapotrzebowanie' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Najbliższe wydania' })).toBeInTheDocument()
  })
})
