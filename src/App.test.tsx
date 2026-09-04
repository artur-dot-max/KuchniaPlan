import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { App } from './App'
import { AuthProvider } from './features/auth/AuthProvider'

describe('App', () => {
  it('shows Supabase setup notice when environment is not configured', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Połącz Supabase' })).toBeInTheDocument()
    expect(screen.getByText(/faoisqiulgowkqmqjumc/)).toBeInTheDocument()
  })
})
