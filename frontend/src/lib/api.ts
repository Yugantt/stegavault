import axios from 'axios'
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import type { AuthTokens } from '../types'

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://127.0.0.1:8618'

const ACCESS_KEY = 'sv_token'
const REFRESH_KEY = 'sv_refresh_token'
const USER_KEY = 'sv_user'

function isDevMode(): boolean {
  try {
    return localStorage.getItem('sv_dev_mode') === 'true'
  } catch {
    return false
  }
}

export const tokenStorage = {
  getAccess: (): string | null => {
    try { return localStorage.getItem(ACCESS_KEY) } catch { return null }
  },
  getRefresh: (): string | null => {
    try { return localStorage.getItem(REFRESH_KEY) } catch { return null }
  },
  setTokens: (access: string, refresh: string): void => {
    try {
      localStorage.setItem(ACCESS_KEY, access)
      localStorage.setItem(REFRESH_KEY, refresh)
    } catch { /* ignore */ }
  },
  setAccess: (access: string): void => {
    try { localStorage.setItem(ACCESS_KEY, access) } catch { /* ignore */ }
  },
  clear: (): void => {
    try {
      localStorage.removeItem(ACCESS_KEY)
      localStorage.removeItem(REFRESH_KEY)
      localStorage.removeItem(USER_KEY)
    } catch { /* ignore */ }
  },
}

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false
let waiters: Array<(token: string | null) => void> = []

function flushWaiters(token: string | null) {
  waiters.forEach((cb) => cb(token))
  waiters = []
}

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined

    // DEV MODE: never refresh / redirect on 401
    if (isDevMode()) {
      return Promise.reject(error)
    }

    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    const url = original.url ?? ''
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }
    const refreshToken = tokenStorage.getRefresh()
    if (!refreshToken) return Promise.reject(error)

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waiters.push((newToken) => {
          if (!newToken) return reject(error)
          original._retry = true
          original.headers.Authorization = `Bearer ${newToken}`
          resolve(api(original))
        })
      })
    }

    isRefreshing = true
    original._retry = true

    try {
      const { data } = await axios.post<AuthTokens>(
        `${API_BASE}/api/v1/auth/refresh`,
        { refresh_token: refreshToken },
      )
      if (!data.access_token) throw new Error('Refresh missing token')
      tokenStorage.setTokens(data.access_token, data.refresh_token ?? refreshToken)
      flushWaiters(data.access_token)
      original.headers.Authorization = `Bearer ${data.access_token}`
      return api(original)
    } catch (refreshErr) {
      tokenStorage.clear()
      flushWaiters(null)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  },
)

export function getApiErrorMessage(
  err: unknown,
  fallback = 'Something went wrong',
): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { detail?: unknown; message?: unknown; error?: unknown }
      | undefined
    if (data && typeof data.detail === 'string' && data.detail.length > 0) {
      return data.detail
    }
    if (data && Array.isArray(data.detail) && data.detail.length > 0) {
      const first = data.detail[0] as { msg?: string } | undefined
      if (first?.msg) return first.msg
    }
    if (data && typeof data.message === 'string' && data.message.length > 0) {
      return data.message
    }
    if (data && typeof data.error === 'string' && data.error.length > 0) {
      return data.error
    }
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return fallback
}
