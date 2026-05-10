// src/components/ui/queue/QueueMobileCard.tsx
// Mobile-only card that replaces a table row on small screens.
import { useNavigate } from 'react-router-dom'
import {
  getTopPrediction,
  getInitials,
  getAvatarGradient,
  genderLabel,
  formatDateOnly,
} from '@/utils/queueHelpers'
import RiskBadge   from '@/components/ui/queue/RiskBadge'
import StatusBadge from '@/components/ui/queue/StatusBadge'
import type { QueueItem } from '@/types/queue'

interface Props {
  item: QueueItem
}

export default function QueueMobileCard({ item }: Props) {
  const navigate = useNavigate()

  const results     = item.results ?? item.result ?? null
  const topPred     = getTopPrediction(results)
  const overallRisk = results?.risk_level ?? topPred?.risk_level ?? 'low'
  const confidence  = results?.ensemble_confidence
  const submittedAt = formatDateOnly(item.submitted_at ?? item.created_at)

  const handleClick = () => navigate('/doctor/review', { state: { report_id: item.id } })

  return (
    <div
      className="rounded-xl border px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.03] min-w-0"
      style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}
      onClick={handleClick}
    >
      {/* Row 1: avatar + name + status badge */}
      <div className="flex items-center gap-3 mb-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
          style={{ background: getAvatarGradient(item.patient_name) }}
        >
          {getInitials(item.patient_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[13px] text-gray-100 truncate leading-tight">
            {item.patient_name ?? 'Unknown Patient'}
          </p>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
            #{item.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Row 2: meta chips — age/gender · date · risk */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2.5">
        {/* Age + gender */}
        {(item.params?.age || item.params?.gender) && (
          <span className="text-[11px] text-gray-400">
            {item.params?.age ?? '—'}
            {item.params?.gender ? ` · ${genderLabel(item.params.gender as string)}` : ''}
          </span>
        )}
        {/* Date */}
        <span className="text-[11px] text-gray-500 font-mono">{submittedAt}</span>
        {/* Risk badge */}
        <RiskBadge level={overallRisk} />
      </div>

      {/* Row 3: top diagnosis + confidence */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          {topPred ? (
            <p className="text-[12px] font-semibold text-gray-200 truncate">
              {topPred.disease_name}
            </p>
          ) : (
            <p className="text-[12px] text-gray-600 italic">No prediction</p>
          )}
        </div>

        {/* Confidence mini-bar */}
        {confidence != null && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(confidence, 100)}%`, background: '#00d4a8' }}
              />
            </div>
            <span className="text-[11px] font-mono font-semibold" style={{ color: '#00d4a8' }}>
              {confidence.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Row 4: Review button — right-aligned */}
      <div className="flex justify-end mt-3 pt-2.5 border-t border-white/[0.05]">
        <button
          onClick={(e) => { e.stopPropagation(); handleClick() }}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
          style={{
            border:     '1px solid rgba(77,163,255,0.25)',
            background: 'rgba(77,163,255,0.08)',
            color:      '#4da3ff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background    = 'rgba(77,163,255,0.18)'
            e.currentTarget.style.borderColor   = 'rgba(77,163,255,0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background    = 'rgba(77,163,255,0.08)'
            e.currentTarget.style.borderColor   = 'rgba(77,163,255,0.25)'
          }}
        >
          Review →
        </button>
      </div>
    </div>
  )
}