// Helpers
import { TrendPoint } from '@/types/progress'

export const DISEASE_LABELS: Record<string, { name: string; icon: string }> = {
  diabetes:       { name: 'Diabetes',       icon: '🩸' },
  hypertension:   { name: 'Hypertension',   icon: '❤️'  },
  heart_disease:  { name: 'Heart Disease',  icon: '🫀' },
  heartDisease:   { name: 'Heart Disease',  icon: '🫀' },
  heartdisease:   { name: 'Heart Disease',  icon: '🫀' },
  kidney_disease: { name: 'Kidney Disease', icon: '🫘' },
  kidneyDisease:  { name: 'Kidney Disease', icon: '🫘' },
  kidneydisease:  { name: 'Kidney Disease', icon: '🫘' },
  liver_disease:  { name: 'Liver Disease',  icon: '🫁' },
  liverDisease:   { name: 'Liver Disease',  icon: '🫁' },
  liverdisease:   { name: 'Liver Disease',  icon: '🫁' },
  anemia:         { name: 'Anemia',         icon: '🔴' },
}

export function diseaseLabel(key: string, fallback?: string) {
  return DISEASE_LABELS[key] ?? DISEASE_LABELS[key.toLowerCase()] ?? {
    name: fallback ?? key,
    icon: '🔬',
  }
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

export function delta(series: TrendPoint[], field: keyof TrendPoint): number | null {
  const vals = series
    .map((p) => p[field] as number | null)
    .filter((v): v is number => v !== null && v !== undefined)
  if (vals.length < 2) return null
  return vals[vals.length - 1] - vals[0]
}

export function toChartData(series: TrendPoint[], field: keyof TrendPoint) {
  return series
    .filter((p) => p[field] !== null && p[field] !== undefined)
    .map((p) => ({ label: p.label, value: p[field] as number }))
}

export const VITALS = [
  { label: 'Blood Glucose', field: 'glucose'    as keyof TrendPoint, unit: 'mg/dL', color: '#4da3ff', lowerIsBetter: true  },
  { label: 'Systolic BP',   field: 'resting_bp' as keyof TrendPoint, unit: 'mmHg',  color: '#ff5f7e', lowerIsBetter: true  },
  { label: 'Body Weight',   field: 'weight'     as keyof TrendPoint, unit: 'kg',    color: '#00d4a8', lowerIsBetter: true  },
  { label: 'BMI',           field: 'bmi'        as keyof TrendPoint, unit: '',      color: '#ffbe3d', lowerIsBetter: true  },
  { label: 'Cholesterol',   field: 'cholesterol'as keyof TrendPoint, unit: 'mg/dL', color: '#a78bfa', lowerIsBetter: true  },
  { label: 'Hemoglobin',    field: 'hemoglobin' as keyof TrendPoint, unit: 'g/dL',  color: '#34d399', lowerIsBetter: false },
] as const