import { createContext, useContext, useState, useCallback } from 'react'
import {
  loginUser,
  registerUser,
  saveSession,
  clearSession,
  getStoredUser,
  isAuthenticated,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser())
  const [authed, setAuthed] = useState(isAuthenticated())

  const login = useCallback(async (email, password) => {
    const data = await loginUser({ email, password })
    saveSession(data.access_token, data.user)
    setUser(data.user)
    setAuthed(true)
    return data.user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const data = await registerUser({ name, email, password })
    saveSession(data.access_token, data.user)
    setUser(data.user)
    setAuthed(true)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setAuthed(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, authed, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
