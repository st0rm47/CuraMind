// src/utils/storage.ts
// Thin wrappers around localStorage with JSON serialisation and error handling.

import { STORAGE_TOKEN_KEY, STORAGE_USER_KEY, STORAGE_THEME_KEY } from './constants'
import type { User } from '@/types/user'

// ── Token ─────────────────────────────────────────────────────────────────────
export function getStoredToken(): string | null {
  try { return localStorage.getItem(STORAGE_TOKEN_KEY) } catch { return null }
}

export function setStoredToken(token: string): void {
  try { localStorage.setItem(STORAGE_TOKEN_KEY, token) } catch { /* silent */ }
}

export function removeStoredToken(): void {
  try { localStorage.removeItem(STORAGE_TOKEN_KEY) } catch { /* silent */ }
}

// ── User ──────────────────────────────────────────────────────────────────────
export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch { return null }
}

export function setStoredUser(user: User): void {
  try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user)) } catch { /* silent */ }
}

export function removeStoredUser(): void {
  try { localStorage.removeItem(STORAGE_USER_KEY) } catch { /* silent */ }
}

// ── Theme ─────────────────────────────────────────────────────────────────────
export function getStoredTheme(): 'dark' | 'light' {
  try {
    const v = localStorage.getItem(STORAGE_THEME_KEY)
    return v === 'light' ? 'light' : 'dark'
  } catch { return 'dark' }
}

export function setStoredTheme(theme: 'dark' | 'light'): void {
  try { localStorage.setItem(STORAGE_THEME_KEY, theme) } catch { /* silent */ }
}

// ── Clear session ─────────────────────────────────────────────────────────────
export function clearSession(): void {
  removeStoredToken()
  removeStoredUser()
}
