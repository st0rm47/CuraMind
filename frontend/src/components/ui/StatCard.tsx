// src/components/ui/StatCard.tsx
import type { ReactNode } from 'react'
import clsx from 'clsx'

type Accent = 'blue' | 'teal' | 'rose' | 'amber'

const accentTop: Record<Accent, string> = {
  blue:  'from-brand-500',
  teal:  'from-teal-500',
  rose:  'from-rose-500',
  amber: 'from-yellow-500',
}

interface StatCardProps {
  label:    string
  value:    ReactNode
  icon?:    string
  note?:    ReactNode
  accent?:  Accent
}

export default function StatCard({ label, value, icon, note, accent = 'blue' }: StatCardProps) {
  return (
    <div className="card relative overflow-hidden">
      {/* Top accent line */}
      <div className={clsx('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent', accentTop[accent])} />

      <p className="text-[10px] font-semibold font-mono text-gray-400 uppercase tracking-[.08em] mb-2">
        {label}
      </p>
      <p className="text-3xl font-extrabold tracking-tight leading-none">{value}</p>

      {icon && (
        <span className="absolute top-4 right-4 text-[26px] opacity-10 select-none">{icon}</span>
      )}
      {note && <div className="text-[11px] text-gray-500 mt-2 font-mono">{note}</div>}
    </div>
  )
}
