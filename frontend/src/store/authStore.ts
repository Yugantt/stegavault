import { create } from 'zustand'
import { api, getApiErrorMessage, tokenStorage } from '../lib/api'
import type { AuthTokens, User } from '../types'

const USER_KEY = 'sv_user'

function readUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch { return null }
}

function writeUser(user: User | null): void {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch { /* ignore */ }
}

interface RegisterPayload { email: string; username: string; password: string }

interface AuthState {
  user: User | null
  token: string | null
  isBootstrapping: boolean
  isSubmitting: boolean
  error: string | null
  setAuth: (tokens: AuthTokens, user: User) => void
  setUser: (user: User) => void
  login: (email: string, password: string) => Promise<boolean>
  register: (payload: RegisterPayload) => Promise<boolean>
  logout: () => void
  bootstrap: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: readUser(),
  token: tokenStorage.getAccess(),
  isBootstrapping: true,
  isSubmitting: false,
  error: null,

  clearError: () => set({ error: null }),

  setAuth: (tokens, user) => {
    tokenStorage.setTokens(tokens.access_token, tokens.refresh_token)
    writeUser(user)
    set({ token: tokens.access_token, user, error: null })
  },

  setUser: (user) => { writeUser(user); set({ user }) },

  login: async (email, password) => {
    set({ isSubmitting: true, error: null })
    try {
      const { data } = await api.post<AuthTokens>('/auth/login', { email, password })
      const me = await api.get<User>('/auth/me', { headers: { Authorization: `Bearer ${data.access_token}` } })
      tokenStorage.setTokens(data.access_token, data.refresh_token)
      writeUser(me.data)
      set({ token: data.access_token, user: me.data, isSubmitting: false, isBootstrapping: false, error: null })
      return true
    } catch (err) {
      set({ isSubmitting: false, isBootstrapping: false, error: getApiErrorMessage(err, 'Login failed') })
      return false
    }
  },

  register: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      await api.post('/auth/register', payload)
    } catch (err) {
      set({ isSubmitting: false, isBootstrapping: false, error: getApiErrorMessage(err, 'Registration failed') })
      return false
    }
    return await get().login(payload.email, payload.password)
  },

  logout: () => {
    tokenStorage.clear()
    writeUser(null)
    set({ user: null, token: null, error: null })
  },

  bootstrap: async () => {
    if (!tokenStorage.getAccess()) {
      set({ isBootstrapping: false })
      return
    }
    try {
      const { data } = await api.get<User>('/auth/me')
      writeUser(data)
      set({ user: data, token: tokenStorage.getAccess(), isBootstrapping: false })
    } catch {
      tokenStorage.clear()
      writeUser(null)
      set({ user: null, token: null, isBootstrapping: false })
    }
  },
}))
