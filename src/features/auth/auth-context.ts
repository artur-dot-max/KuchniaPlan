import { createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous' | 'unconfigured'

export type AuthContextValue = {
  session: Session | null
  signOut: () => Promise<void>
  status: AuthStatus
  user: User | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
