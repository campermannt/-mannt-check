"use client"

/**
 * Server-backed auth — nick + password with Hono backend.
 * Sessions stored in localStorage, data synced with server.
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { hydrateFromServer, clearAllAppData } from '@/lib/storage'
import { apiDeleteAccount } from '@/lib/api'

export interface NxcodeUser {
  id: string
  email: string
  name: string | null
  avatar: string | null
  balance?: number
}

const API_BASE = 'https://thr-50b4d891-mannt-api.nxcode-io.workers.dev'
const TOKEN_KEY = 'mannt_auth_token'
const USER_KEY = 'mannt_auth_user'

function loadToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function loadCachedUser(): NxcodeUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveAuth(token: string, user: NxcodeUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearAuth() {
  // Clear ALL app data — not just token/user
  clearAllAppData()
}

function serverUserToNxcode(serverUser: { id: string; nick: string }): NxcodeUser {
  return {
    id: serverUser.id,
    email: serverUser.nick + '@mannt',
    name: serverUser.nick,
    avatar: null,
    balance: 0,
  }
}

// ==================== Context ====================

interface AuthContextType {
  user: NxcodeUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (nick: string, password: string) => Promise<NxcodeUser>
  register: (nick: string, password: string) => Promise<NxcodeUser>
  logout: () => Promise<void>
  deleteAccount: (password: string) => Promise<void>
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

// ==================== Provider Hook ====================

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<NxcodeUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = loadToken()
    const cached = loadCachedUser()

    if (!token) {
      setIsLoading(false)
      return
    }

    // Restore from cache immediately, then verify with server
    if (cached) setUser(cached)

    // Verify token with server
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then((data: { user: { id: string; nick: string } } | null) => {
        if (data?.user) {
          const u = serverUserToNxcode(data.user)
          setUser(u)
          localStorage.setItem(USER_KEY, JSON.stringify(u))
        } else {
          clearAuth()
          setUser(null)
        }
      })
      .catch(() => {
        // Network error — keep cached user (offline mode)
        if (!cached) setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const register = useCallback(async (nick: string, password: string): Promise<NxcodeUser> => {
    // 1. Clear ALL previous user data before registering new account
    clearAllAppData()

    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nick: nick.trim(), password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Rejestracja nie powiodła się.')

    const u = serverUserToNxcode(data.user)
    saveAuth(data.token, u)
    setUser(u)
    // New account starts empty — no sync needed
    return u
  }, [])

  const login = useCallback(async (nick: string, password: string): Promise<NxcodeUser> => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nick: nick.trim(), password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Logowanie nie powiodło się.')

    const u = serverUserToNxcode(data.user)

    // Clear previous user's data BEFORE saving new auth token
    clearAllAppData()
    saveAuth(data.token, u)
    setUser(u)

    // Pull server data into local cache
    try {
      await hydrateFromServer()
    } catch {
      // non-fatal
    }

    return u
  }, [])

  const logout = useCallback(async () => {
    const token = loadToken()
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch { /* ignore */ }
    }
    // Clear ALL app data on logout
    clearAllAppData()
    setUser(null)
  }, [])

  const deleteAccount = useCallback(async (password: string): Promise<void> => {
    const result = await apiDeleteAccount(password)
    if (!result.ok) throw new Error(result.error ?? 'Nie udało się usunąć konta.')
    // Wipe all local data and log out
    clearAllAppData()
    setUser(null)
  }, [])

  const getToken = useCallback(() => {
    return loadToken()
  }, [])

  return { user, isLoading, isAuthenticated: !!user, login, register, logout, deleteAccount, getToken }
}

export { AuthContext }
