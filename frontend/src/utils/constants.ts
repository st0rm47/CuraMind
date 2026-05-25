// src/utils/constants.ts

export const APP_NAME    = 'CuraMind'
export const APP_VERSION = '1.0.0'
export const APP_TAGLINE = 'AI-Powered Predictive Health Intelligence'

/** Base URL for the FastAPI backend — reads from .env, falls back to localhost */
export const API_BASE_URL = (import.meta as any).env.VITE_API_URL ?? 'http://localhost:8000'

/** LocalStorage keys */
export const STORAGE_TOKEN_KEY = 'curamind_access_token'
export const STORAGE_USER_KEY  = 'curamind_user'
export const STORAGE_THEME_KEY = 'curamind_theme'

/** Risk level thresholds */
export const RISK_THRESHOLDS = {
  low:      [0,  30],
  medium:   [30, 50],
  high:     [50, 70],
  critical: [70, 100],
} as const

/** Disease display metadata */
export const DISEASE_META = {
  diabetes:     { icon: '🩸', label: 'Diabetes',       color: '#4da3ff' },
  hypertension: { icon: '❤️',  label: 'Hypertension',   color: '#ff5f7e' },
  heartDisease: { icon: '🫀', label: 'Heart Disease',   color: '#ff5f7e' },
  kidneyDisease:{ icon: '🫘', label: 'Kidney Disease',  color: '#ffbe3d' },
  liverDisease: { icon: '🫁', label: 'Liver Disease',   color: '#a78bfa' },
  anemia:       { icon: '🔴', label: 'Anemia',          color: '#00d4a8' },
} as const

/** Nav labels used by topbar */
export const PAGE_TITLES: Record<string, string> = {
  '/patient/dashboard':   'Patient Dashboard',
  '/patient/reports':     'My Reports',
  '/doctor/dashboard':    'Doctor Overview',
  '/doctor/queue':        'Patient Queue',
  '/doctor/review':       'Case Review',
  '/doctor/analytics':    'Analytics',
}

export const STEPS_LABELS = [
  'Personal Info',
  'Vitals',
  'Lab Values',
  'Lifestyle',
  'Review & Submit',
] as const
