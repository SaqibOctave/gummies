import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Admin } from '@/types/auth'
import * as authApi from '@/api/auth'
import { setAccessToken, setSessionExpiredHandler } from '@/api/httpClient'
import { AuthContext } from './auth-context'
import type { AuthStatus } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const hasStartedRestore = useRef(false)

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setAdmin(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    setSessionExpiredHandler(clearSession)
    return () => setSessionExpiredHandler(null)
  }, [clearSession])

  // Silently restore a session from the httpOnly refresh cookie on first load.
  useEffect(() => {
    // Guards against React StrictMode double-invoking this effect in dev:
    // refresh tokens are single-use (rotated on every call), so a second
    // concurrent call would 401 on the already-revoked token and wipe out
    // the session the first call just restored. AuthProvider lives for the
    // app's whole lifetime, so "only dispatch once" is the correct semantics
    // here, not "cancel on cleanup".
    if (hasStartedRestore.current) return
    hasStartedRestore.current = true

    async function restore() {
      try {
        const { accessToken } = await authApi.refresh()
        setAccessToken(accessToken)
        const me = await authApi.getMe()
        setAdmin(me)
        setStatus('authenticated')
      } catch {
        clearSession()
      }
    }

    restore()
  }, [clearSession])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password)
    setAccessToken(result.accessToken)
    setAdmin(result.admin)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  return (
    <AuthContext.Provider value={{ admin, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
