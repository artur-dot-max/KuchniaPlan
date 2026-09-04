import type { FormEvent } from 'react'
import { useState } from 'react'

import { supabase } from '../../lib/supabase'

type AuthMode = 'sign-in' | 'sign-up'

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!supabase) {
      setMessage('Brakuje konfiguracji Supabase.')
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    const result =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: email.split('@')[0],
              },
            },
          })

    setIsSubmitting(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    if (mode === 'sign-up') {
      setMessage('Konto zostało utworzone. Sprawdź e-mail, jeśli Supabase wymaga potwierdzenia.')
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel" aria-labelledby="auth-heading">
        <div>
          <p className="eyebrow">KuchniaPlan</p>
          <h1 id="auth-heading">{mode === 'sign-in' ? 'Logowanie' : 'Utwórz konto'}</h1>
          <p className="page-lead">
            Dostęp do planu produkcji wymaga konta użytkownika i członkostwa w organizacji.
          </p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Hasło
            <input
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {message ? <p className="form-message">{message}</p> : null}

          <button className="primary-action" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Przetwarzanie...' : mode === 'sign-in' ? 'Zaloguj' : 'Utwórz konto'}
          </button>
        </form>

        <button
          className="text-action"
          onClick={() => setMode((current) => (current === 'sign-in' ? 'sign-up' : 'sign-in'))}
          type="button"
        >
          {mode === 'sign-in' ? 'Nie masz konta? Utwórz konto' : 'Masz konto? Zaloguj'}
        </button>
      </section>
    </main>
  )
}
