// src/components/ui/Badge.tsx
import clsx from 'clsx'
import type { RiskLevel } from '@/types/report'

const ICON: Record<RiskLevel, string> = {
  low:      '✓',
  medium:   '~',
  high:     '↑',
  critical: '⚠',
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={clsx('badge', `badge-${level}`)}>
      {ICON[level]} {level}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'tag tag-amber',
    reviewed:       'tag tag-teal',
    archived:       'tag bg-gray-500/10 text-gray-400 border border-gray-500/20',
  }
  const label: Record<string, string> = {
    pending: '⏳ Pending',
    reviewed:       '✓ Reviewed',
    archived:       'Archived',
  }
  return (
    <span className={map[status] ?? 'tag bg-gray-500/10 text-gray-400'}>
      {label[status] ?? status}
    </span>
  )
}
