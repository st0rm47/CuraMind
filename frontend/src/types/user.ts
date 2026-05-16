// src/types/user.ts

export type UserRole = 'patient' | 'doctor' | 'admin'  // Added 'admin' role 
export type Gender   = 'male' | 'female' | 'other'

export interface User {
  id:           string
  email:        string
  name:         string
  role:         UserRole
  dob?:         string
  gender?:      Gender
  phone?:       string
  specialty?:   string
  license_number?: string
  is_active?:   boolean
  created_at?:  string
}

export interface LoginCredentials {
  email:    string
  password: string
}

export interface RegisterPayload {
  name:       string
  email:      string
  password:   string
  role:       UserRole
  dob?:       string
  gender?:    Gender
  phone?:     string
  speciality?: string
  license_number?: string

}

export interface AuthResponse {
  access_token: string
  token_type:   'bearer'
  user:         User
}

export interface AuthContextValue {
  user:            User | null
  token:           string | null
  isAuthenticated: boolean
  isLoading:       boolean
  login:           (credentials: LoginCredentials) => Promise<AuthResponse>
  register:        (payload: RegisterPayload) => Promise<AuthResponse>
  logout:          () => void
}
