// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

import toast from 'react-hot-toast'
import type { AuthContextValue, LoginCredentials, RegisterPayload, User } from '@/types/user'
import { loginApi, registerApi, getMeApi } from '@/services/auth.service'
import {
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  clearSession,
} from '@/utils/storage'

const AuthCtx = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(getStoredUser)
  const [token,     setToken]     = useState<string | null>(getStoredToken)
  const [isLoading, setIsLoading] = useState(false)

  // On mount, check if we have a token and try to fetch the user
  useEffect(() => {
    const storedToken = getStoredToken()
    if (!storedToken) return

    setIsLoading(true)
    getMeApi()
      .then((u) => { setUser(u); setStoredUser(u) })
      .catch(() => { clearSession(); setUser(null); setToken(null) })
      .finally(() => setIsLoading(false))
  }, [])

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const res = await loginApi(credentials)
      setStoredToken(res.access_token)
      setStoredUser(res.user)
      setToken(res.access_token)
      setUser(res.user)
      toast.success(`Welcome back, ${res.user.name.split(' ')[0] ?? 'User'}!`)
      return res
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Register
  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true)
    try {
      const res = await registerApi(payload)
      setStoredToken(res.access_token)
      setStoredUser(res.user)
      setToken(res.access_token)
      setUser(res.user)
      toast.success('Account created successfully!')
      return res
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout: clear session and auth state
  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setToken(null)
    toast.success('Signed out successfully')
  }, [])

  // Return the provider with the auth context value
  return (
    <AuthCtx.Provider
      value={{ user, token, isAuthenticated: !!token, isLoading, login, register, logout }}
    >
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
