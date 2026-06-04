import { ADMIN_PASSWORD } from './adminAuth'

export const ADMIN_SESSION_KEY = 'porra_admin_password'

export function getAdminPassword() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(ADMIN_SESSION_KEY) || ''
}

export function setAdminPassword(password) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ADMIN_SESSION_KEY, password)
}

export function clearAdminPassword() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ADMIN_SESSION_KEY)
}

export function hasAdminSession() {
  return getAdminPassword() === ADMIN_PASSWORD
}

export function adminFetch(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
    'x-admin-password': getAdminPassword() || ADMIN_PASSWORD
  }
  return fetch(url, { ...options, headers })
}
