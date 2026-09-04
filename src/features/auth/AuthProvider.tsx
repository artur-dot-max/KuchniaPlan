import type { Session } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? 'checking' : 'unconfigured',
  )

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return
      }

      setSession(data.session)
      setStatus(data.session ? 'authenticated' : 'anonymous')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setStatus(nextSession ? 'authenticated' : 'anonymous')
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      signOut: async () => {
        if (!supabase) {
          return
        }

        await supabase.auth.signOut()
      },
      status,
      user: session?.user ?? null,
    }),
    [session, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
