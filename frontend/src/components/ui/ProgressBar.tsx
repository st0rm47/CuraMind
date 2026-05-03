// src/components/ui/ProgressBar.tsx
import clsx from 'clsx'
import { getRiskLevel, getRiskColor } from '@/components/common/riskUtils'

interface ProgressBarProps {
  label:  string
  value:  number
  color?: string
  className?: string
}

export default function ProgressBar({ label, value, color, className }: ProgressBarProps) {
  const level = getRiskLevel(value)
  const col   = color ?? getRiskColor(level)

  return (
    <div className={clsx('mb-3', className)}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[13px] font-semibold text-gray-200">{label}</span>
        <span className="font-mono text-[12px]" style={{ color: col }}>{value}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${col}99, ${col})` }}
        />
      </div>
    </div>
  )
}
