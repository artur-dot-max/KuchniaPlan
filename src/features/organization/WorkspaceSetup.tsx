import type { FormEvent } from 'react'
import { useState } from 'react'

import { createLocationSchema, createOrganizationSchema } from '../../domain/access/validation'

type WorkspaceSetupProps = {
  error: string | null
  isLoading: boolean
  onCreate: (input: { locationName: string; organizationName: string }) => Promise<void>
}

export function WorkspaceSetup({ error, isLoading, onCreate }: WorkspaceSetupProps) {
  const [locationName, setLocationName] = useState('Kuchnia główna')
  const [organizationName, setOrganizationName] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const organizationResult = createOrganizationSchema.safeParse({ name: organizationName })
    const locationResult = createLocationSchema
      .omit({ organizationId: true })
      .safeParse({ name: locationName })

    if (!organizationResult.success || !locationResult.success) {
      setValidationError(
        organizationResult.error?.issues[0]?.message ??
          locationResult.error?.issues[0]?.message ??
          'Popraw dane organizacji.',
      )
      return
    }

    setValidationError(null)
    await onCreate({
      locationName: locationResult.data.name,
      organizationName: organizationResult.data.name,
    })
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel" aria-labelledby="workspace-heading">
        <div>
          <p className="eyebrow">Pierwsze uruchomienie</p>
          <h1 id="workspace-heading">Utwórz organizację</h1>
          <p className="page-lead">
            Organizacja oddziela dane firmy. Lokalizacja pozwala planować produkcję dla konkretnej
            kuchni lub obiektu.
          </p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Nazwa firmy
            <input
              onChange={(event) => setOrganizationName(event.target.value)}
              required
              value={organizationName}
            />
          </label>
          <label>
            Pierwsza lokalizacja
            <input
              onChange={(event) => setLocationName(event.target.value)}
              required
              value={locationName}
            />
          </label>

          {validationError ? <p className="form-message">{validationError}</p> : null}
          {error ? <p className="form-message">{error}</p> : null}

          <button className="primary-action" disabled={isLoading} type="submit">
            {isLoading ? 'Tworzenie...' : 'Utwórz organizację'}
          </button>
        </form>
      </section>
    </main>
  )
}
