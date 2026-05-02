// src/services/auth.service.ts
// Handles all authentication API calls.

import api from './api'
import type { AuthResponse, LoginCredentials, RegisterPayload, User } from '@/types/user'

/**
 * POST /auth/login
 * FastAPI expects OAuth2 form data (application/x-www-form-urlencoded).
 */
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  const params = new URLSearchParams()
  params.append('username', credentials.email)
  params.append('password', credentials.password)

  const { data } = await api.post<AuthResponse>('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

/**
 * POST /auth/register
 */
export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

/**
 * GET /auth/me — fetch the current authenticated user
 */
export async function getMeApi(): Promise<User> {
  const { data } = await api.get<User>('/auth/me')
  return data
}
