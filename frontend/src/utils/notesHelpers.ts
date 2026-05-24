import type { DiseaseKey }     from '@/types/report'

export const KEY_MAP: Record<string, DiseaseKey> = {
  diabetes:       'diabetes',
  hypertension:   'hypertension',
  heart_disease:  'heartDisease',
  heartdisease:   'heartDisease',
  heartDisease:   'heartDisease',
  kidney_disease: 'kidneyDisease',
  kidneydisease:  'kidneyDisease',
  kidneyDisease:  'kidneyDisease',
  liver_disease:  'liverDisease',
  liverdisease:   'liverDisease',
  liverDisease:   'liverDisease',
  anemia:         'anemia',
}

export function riskColor(level: string | null): string {
  switch ((level ?? '').toLowerCase()) {
    case 'critical': return '#ff1744'
    case 'high':     return '#ff5f7e'
    case 'medium':
    case 'moderate': return '#ffbe3d'
    case 'low':      return '#00d4a8'
    default:         return '#6b7280'
  }
}

export function riskLabel(level: string | null): string {
  if (!level) return '—'
  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
}

export function getInitials(name: string | null): string {
  if (!name) return 'Dr'
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}