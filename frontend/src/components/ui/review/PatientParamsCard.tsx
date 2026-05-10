// src/components/ui/review/PatientParamsCard.tsx
import { buildParamRows } from '@/utils/reviewHelpers'
import type { ParamRow } from '@/utils/reviewHelpers'
import type { ReviewItem } from '@/types/review'
import { formatDateTime } from '@/utils/formatDate'
import { formatParamValue } from '@/utils/reviewHelpers'

interface Props { item: ReviewItem }

const GROUP_META: Record<ParamRow['group'], { label: string; accent: string }> = {
  vitals:    { label: 'Vitals',          accent: '#4da3ff' },
  labs:      { label: 'Laboratory',      accent: '#00d4a8' },
  cardiac:   { label: 'Cardiac Profile', accent: '#f87171' },
  lifestyle: { label: 'Lifestyle',       accent: '#a78bfa' },
}

const GROUP_ORDER: ParamRow['group'][] = ['vitals', 'labs', 'cardiac', 'lifestyle']

export default function PatientParamsCard({ item }: Props) {
  const rows        = buildParamRows(item.params ?? {})
  const submittedAt = item.submitted_at ?? item.created_at

  const grouped = GROUP_ORDER.reduce<Record<string, ParamRow[]>>((acc, g) => {
    acc[g] = rows.filter((r) => r.group === g)
    return acc
  }, {})

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden min-w-0">

      {/* Card header — FIX 1: flex-wrap so patient pill drops below on mobile */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
            style={{ background: 'rgba(77,163,255,0.15)' }}>
            🧬
          </div>
          <div>
            <p className="text-[14px] font-bold text-gray-100 m-0">Patient Parameters</p>
            <p className="text-[11px] text-gray-500 mt-0.5 m-0">
              Submitted: {formatDateTime(submittedAt)}
            </p>
          </div>
        </div>

        {/* Patient pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
          style={{ background: 'rgba(77,163,255,0.08)', border: '1px solid rgba(77,163,255,0.18)' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#4da3ff,#00d4a8)' }}>
            {(item.patient_name ?? 'P')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-[12px] font-semibold text-gray-100 m-0 leading-tight">
              {item.patient_name ?? 'Patient'}
            </p>
            <p className="text-[10px] text-gray-500 font-mono m-0">
              #{item.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Groups grid — FIX 2: single col on mobile, 2-col on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 1, background: 'rgba(255,255,255,0.04)' }}>
        {GROUP_ORDER.map((group) => {
          const meta      = GROUP_META[group]
          const groupRows = grouped[group]
          if (!groupRows.length) return null
          return (
            <div key={group} className="px-4 sm:px-[18px] py-4" style={{ background: 'rgba(10,12,18,0.95)' }}>
              {/* Group label */}
              <div className="flex items-center gap-1.5 mb-3 pb-2.5"
                style={{ borderBottom: `1px solid ${meta.accent}22` }}>
                <div className="w-[3px] h-3.5 rounded-sm shrink-0" style={{ background: meta.accent }} />
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest"
                  style={{ color: meta.accent }}>
                  {meta.label}
                </span>
              </div>

              {/* Param rows */}
              <div className="flex flex-col">
                {groupRows.map((row, idx) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-1.5 min-w-0"
                    style={{ borderBottom: idx < groupRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 mr-2">
                      <span className="text-[13px] shrink-0">{row.icon}</span>
                      {/* FIX 3: truncate long param labels on very small screens */}
                      <span className="text-[12px] text-gray-400 truncate">{row.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span className="text-[12px] font-semibold font-mono text-gray-100">
                        {formatParamValue(row.label, row.value)}
                      </span>
                      {row.unit && (
                        <span className="text-[10px] text-gray-500">{row.unit}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Symptoms */}
      {item.params?.symptoms && (
        <div className="px-4 sm:px-5 py-3.5 border-t border-white/[0.06]"
          style={{ background: 'rgba(248,113,113,0.04)' }}>
          <p className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#f87171] mb-1.5">
            🩹 Reported Symptoms
          </p>
          {/* FIX 4: break-words on symptom text */}
          <p className="text-[13px] text-gray-300 leading-relaxed m-0 break-words">
            {item.params.symptoms}
          </p>
        </div>
      )}
    </div>
  )
}