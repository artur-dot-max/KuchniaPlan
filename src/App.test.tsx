import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { App } from './App'
import { AuthProvider } from './features/auth/AuthProvider'

describe('App', () => {
  it('renders the expected entry screen for the current Supabase configuration', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: /Połącz Supabase|Logowanie/ }),
    ).toBeInTheDocument()
  })
})
