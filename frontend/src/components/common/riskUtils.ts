// src/components/common/riskUtils.ts
import type { RiskLevel, DiseaseKey } from '@/types/report'

export function getRiskLevel(value: number): RiskLevel {
  if (value >= 70) return 'critical'
  if (value >= 50) return 'high'
  if (value >= 30) return 'medium'
  return 'low'
}

export function getRiskColor(level: RiskLevel): string {
  return {
    low:      '#00c896',
    medium:   '#ffbe3d',
    high:     '#ff5f7e',
    critical: '#ff1744',
  }[level]
}

export function humanize(str: string): string {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
}

export const DISEASE_META: Record<DiseaseKey, { icon: string; name: string }> = {
  diabetes:     { icon: '🩸', name: 'Diabetes' },
  hypertension: { icon: '❤️',  name: 'Hypertension' },
  heartDisease: { icon: '🫀', name: 'Heart Disease' },
  kidneyDisease:{ icon: '🫘', name: 'Kidney Disease' },
  liverDisease: { icon: '🫁', name: 'Liver Disease' },
  anemia:       { icon: '🔴', name: 'Anemia' },
}
