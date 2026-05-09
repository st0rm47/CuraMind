import type { AssessmentResult, Prediction, RiskLevel } from '@/types/queue'

export const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; bg: string; text: string; dot: string }
> = {
  low:      { label: 'Low',      bg: 'rgba(29,158,117,0.12)', text: '#1D9E75', dot: '#1D9E75' },
  medium: { label: 'Medium', bg: 'rgba(186,117,23,0.12)', text: '#BA7517', dot: '#BA7517' },
  high:     { label: 'High',     bg: 'rgba(216,90,48,0.12)',  text: '#afa9a7', dot: '#D85A30' },
  critical: { label: 'Critical', bg: 'rgba(226,75,74,0.12)',  text: '#E24B4A', dot: '#E24B4A' },
}

export const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: string }
> = {
  reviewed:       { label: ' Reviewed',    icon: '✔' ,   bg: 'rgba(29,158,117,0.12)', text: '#1D9E75' },
  pending:        { label: ' Pending',     icon: '⏳',   bg: 'rgba(186,117,23,0.12)', text: '#BA7517' },
  completed:      { label: ' Completed',   icon: '✔',    bg: 'rgba(55,138,221,0.12)', text: '#378ADD' },
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #4da3ff, #00d4a8)',
  'linear-gradient(135deg, #a78bfa, #ec4899)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #8b5cf6, #06b6d4)',
]

export function getRiskConfig(level: string) {
  const key = (level ?? '').toLowerCase() as RiskLevel
  return RISK_CONFIG[key] ?? RISK_CONFIG.low
}

export function getStatusConfig(status: string) {
  const key = (status ?? '').toLowerCase()
  return (
    STATUS_CONFIG[key] ?? {
      label: status || 'Unknown',
      bg: 'rgba(136,135,128,0.12)',
      text: '#888780',
    }
  )
}

export function getTopPrediction(results?: AssessmentResult | null): Prediction | null {
  if (!results?.predictions) return null
  const entries = Object.values(results.predictions)
  if (!entries.length) return null
  return entries.sort((a, b) => b.probability - a.probability)[0]
}

export function getInitials(name: string | null): string {
  if (!name) return 'P'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'P'
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

export function getAvatarGradient(name: string | null): string {
  if (!name) return AVATAR_GRADIENTS[0]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[index]
}

export function genderLabel(g?: string): string {
  if (!g) return '—'
  const lower = g.toLowerCase()
  if (lower === 'm' || lower === 'male') return 'Male'
  if (lower === 'f' || lower === 'female') return 'Female'
  return g
}

export function formatDateOnly(date?: string) {
  if (!date) return '—'
  return date.split('T')[0]
}