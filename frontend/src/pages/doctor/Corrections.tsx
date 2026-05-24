// src/pages/doctor/Corrections.tsx
import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import toast                   from 'react-hot-toast'
import Card, { CardHeader }    from '@/components/ui/Card'
import Button                  from '@/components/ui/Button'
import Spinner                 from '@/components/ui/Spinner'
import EmptyState              from '@/components/common/EmptyState'
import { getErrorMessage }     from '@/services/api'
import { formatDateTime }      from '@/utils/formatDate'
import { DISEASE_META }        from '@/components/common/riskUtils'
import api                     from '@/services/api'
import type { DiseaseKey }     from '@/types/report'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CorrectionItem {
  review_id:       string
  report_id:       string
  patient_name:    string
  doctor_name:     string
  disease:         string
  ai_score:        number | null
  ai_risk_level:   string | null
  doctor_override: string | null
  overall_risk:    string | null
  confidence:      number | null
  created_at:      string | null
  has_override:    boolean
  diagnosis:       string | null
}

interface CorrectionsResponse {
  corrections: CorrectionItem[]
  total:       number
  page:        number
  pages:       number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const KEY_MAP: Record<string, DiseaseKey> = {
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

function riskColor(level: string | null): string {
  switch ((level ?? '').toLowerCase()) {
    case 'critical': return '#ff1744'
    case 'high':     return '#ff5f7e'
    case 'medium':
    case 'moderate': return '#ffbe3d'
    case 'low':      return '#00d4a8'
    default:         return '#6b7280'
  }
}

function riskLabel(level: string | null): string {
  if (!level) return '—'
  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function diseaseDisplay(key: string | null): { name: string; icon: string } {
  if (!key) return { name: 'All Diseases', icon: '🫀' }
  const mapped = KEY_MAP[key] ?? KEY_MAP[key.toLowerCase()]
  if (mapped && DISEASE_META[mapped]) return DISEASE_META[mapped]
  return { name: key.replace(/_/g, ' '), icon: '🫀' }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DoctorCorrections() {
  const navigate              = useNavigate()
  const [data,    setData]    = useState<CorrectionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [filter,  setFilter]  = useState<'all' | 'overridden' | 'confirmed'>('all')

  const load = (p: number) => {
    setLoading(true)
    api
      .get<CorrectionsResponse>('/doctor/corrections', { params: { page: p, limit: 30 } })
      .then((res) => { setData(res.data); setPage(p) })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(1) }, [])

  const allItems   = data?.corrections ?? []
  const total      = data?.total       ?? 0
  const pages      = data?.pages       ?? 1

  const overriddenCount = allItems.filter((i) => i.has_override).length
  const confirmedCount  = allItems.filter((i) => !i.has_override).length

  const filtered = filter === 'overridden'
    ? allItems.filter((i) => i.has_override)
    : filter === 'confirmed'
    ? allItems.filter((i) => !i.has_override)
    : allItems

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  }

  return (
    <div className="animate-fade-in space-y-5 sm:space-y-6 w-full min-w-0">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="page-title">Risk Corrections</h1>
          <p className="page-sub">
            AI classifications reviewed and corrected by clinical judgment
          </p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
            {total} review{total !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {allItems.length === 0 ? (
        <Card>
          <EmptyState
            icon="✏️"
            title="No corrections yet"
            description="Reviewed assessments and risk corrections will appear here."
          />
        </Card>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Total Reviews',   value: total,           color: '#4da3ff', bg: 'rgba(77,163,255,0.08)',  border: 'rgba(77,163,255,0.15)'  },
              { label: 'AI Corrected',    value: overriddenCount, color: '#ffbe3d', bg: 'rgba(255,190,61,0.08)', border: 'rgba(255,190,61,0.15)'  },
              { label: 'AI Confirmed',    value: confirmedCount,  color: '#00d4a8', bg: 'rgba(0,212,168,0.08)',  border: 'rgba(0,212,168,0.15)'   },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-3 sm:px-4 py-3 min-w-0"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wide font-medium truncate mb-1">
                  {s.label}
                </p>
                <p className="text-2xl sm:text-[26px] font-bold leading-none tabular-nums"
                  style={{ color: s.color }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
            {([
              { id: 'all',       label: 'All Reviews',  icon: '📋' },
              { id: 'overridden',label: 'AI Corrected', icon: '✏️' },
              { id: 'confirmed', label: 'AI Confirmed', icon: '✓'  },
            ] as const).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="flex items-center gap-1.5 whitespace-nowrap shrink-0 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150"
                style={{
                  border:     filter === f.id ? 'none'       : '1px solid rgba(255,255,255,0.08)',
                  background: filter === f.id ? '#4da3ff'    : 'rgba(255,255,255,0.04)',
                  color:      filter === f.id ? '#fff'       : '#9ca3af',
                }}
              >
                <span className="text-[11px]">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          {/* Corrections list */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader
              title="Review History"
              subtitle={`${filtered.length} record${filtered.length !== 1 ? 's' : ''} · most recent first`}
            />

            {filtered.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-gray-500">
                No records match this filter.
              </div>
            ) : (
              <>
                {/* ── Desktop table (hidden on mobile) ── */}
                <div className="hidden md:block overflow-x-auto mt-3 rounded-xl border border-gray-800">
                  <table className="w-full text-sm min-w-[780px]">
                    <thead>
                      <tr className="bg-gray-800/70">
                        {['Patient', 'Disease', 'AI Score', 'AI Level', 'Doctor Decision', 'Confidence', 'Date', 'Action'].map((h) => (
                          <th key={h}
                            className="px-3 py-2.5 text-left text-[9px] font-bold font-mono uppercase tracking-widest text-gray-500 border-b border-gray-700/60 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, i) => (
                        <DesktopRow key={`${item.review_id}-${item.disease ?? 'all'}-${i}`} item={item} navigate={navigate} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile card list (hidden on md+) ── */}
                <div className="md:hidden mt-3 space-y-2">
                  {filtered.map((item, i) => (
                    <MobileCard key={`${item.review_id}-${item.disease ?? 'all'}-${i}`} item={item} navigate={navigate} />
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between sm:justify-center gap-3">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => load(page - 1)}>
                ← Previous
              </Button>
              <span className="text-[12px] text-gray-500 font-mono">{page} / {pages}</span>
              <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => load(page + 1)}>
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Desktop table row ─────────────────────────────────────────────────────────

function DesktopRow({ item, navigate }: { item: CorrectionItem; navigate: ReturnType<typeof useNavigate> }) {
  const disease = diseaseDisplay(item.disease)
  const aiColor  = riskColor(item.ai_risk_level)
  const docColor = riskColor(item.doctor_override)

  return (
    <tr
      className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors cursor-pointer"
      onClick={() => navigate('/doctor/review', { state: { report_id: item.report_id } })}
    >
      {/* Patient */}
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#4da3ff,#00d4a8)' }}>
            {getInitials(item.patient_name)}
          </div>
          <span className="font-semibold text-[12px] text-gray-200">{item.patient_name}</span>
        </div>
      </td>

      {/* Disease */}
      <td className="px-3 py-3 whitespace-nowrap">
        {item.has_override ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{disease.icon}</span>
            <span className="text-[12px] text-gray-200">{disease.name}</span>
          </div>
        ) : (
            <div className="flex items-center gap-1.5">
            <span className="text-sm">{disease.icon}</span>
            <span className="text-[11px] text-gray-500 italic">Heart Disease</span>
          </div>
          
        )}
      </td>

      {/* AI Score */}
      <td className="px-3 py-3 whitespace-nowrap">
        {item.ai_score !== null ? (
          <div className="flex items-center gap-2">
            <div className="w-10 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${item.ai_score}%`, background: aiColor }} />
            </div>
            <span className="font-mono text-[11px] text-gray-400">{item.ai_score}%</span>
          </div>
        ) : <span className="text-gray-600">—</span>}
      </td>

      {/* AI Level */}
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${aiColor}20`, color: aiColor }}>
          {riskLabel(item.ai_risk_level)}
        </span>
      </td>

      {/* Doctor Decision */}
      <td className="px-3 py-3 whitespace-nowrap">
        {item.has_override ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full line-through opacity-40"
              style={{ background: `${aiColor}18`, color: aiColor }}>
              {riskLabel(item.ai_risk_level)}
            </span>
            <span className="text-gray-500 text-[10px]">→</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${docColor}22`, color: docColor }}>
              {riskLabel(item.doctor_override)}
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400">
            ✓ Confirmed
          </span>
        )}
      </td>

      {/* Confidence */}
      <td className="px-3 py-3 whitespace-nowrap">
        {item.confidence !== null ? (
          <span className="font-mono text-[11px] text-gray-400">{item.confidence}%</span>
        ) : <span className="text-gray-600">—</span>}
      </td>

      {/* Date */}
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="font-mono text-[11px] text-gray-400">
          {item.created_at ? formatDateTime(item.created_at) : '—'}
        </span>
      </td>

      {/* Action */}
      <td className="px-3 py-3 whitespace-nowrap">
        <button
          onClick={(e) => { e.stopPropagation(); navigate('/doctor/review', { state: { report_id: item.report_id } }) }}
          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
          style={{ border: '1px solid rgba(77,163,255,0.25)', background: 'rgba(77,163,255,0.08)', color: '#4da3ff' }}
        >
          View →
        </button>
      </td>
    </tr>
  )
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function MobileCard({ item, navigate }: { item: CorrectionItem; navigate: ReturnType<typeof useNavigate> }) {
  const disease  = diseaseDisplay(item.disease)
  const aiColor  = riskColor(item.ai_risk_level)
  const docColor = riskColor(item.doctor_override)

  return (
    <div
      className="rounded-xl border px-4 py-3 cursor-pointer transition-colors min-w-0"
      style={{ borderColor: item.has_override ? 'rgba(255,190,61,0.2)' : 'rgba(0,212,168,0.15)', background: item.has_override ? 'rgba(255,190,61,0.03)' : 'rgba(0,212,168,0.03)' }}
      onClick={() => navigate('/doctor/review', { state: { report_id: item.report_id } })}
    >
      {/* Row 1: patient + date + status badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#4da3ff,#00d4a8)' }}>
            {getInitials(item.patient_name)}
          </div>
          <span className="font-semibold text-[13px] text-gray-100 truncate">{item.patient_name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.has_override ? (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 uppercase tracking-wide">
              ✏ Corrected
            </span>
          ) : (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 uppercase tracking-wide">
              ✓ Confirmed
            </span>
          )}
        </div>
      </div>

      {/* Row 2: disease + AI score bar */}
      {item.has_override && (
        <div className="flex items-center justify-between gap-3 mb-2.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">{disease.icon}</span>
            <span className="text-[12px] font-semibold text-gray-200 truncate">{disease.name}</span>
          </div>
          {item.ai_score !== null && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.ai_score}%`, background: aiColor }} />
              </div>
              <span className="font-mono text-[11px] text-gray-400">{item.ai_score}%</span>
            </div>
          )}
        </div>
      )}

      {/* Row 3: AI level → Doctor override (or confirmed badge) */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        {item.has_override ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-500">AI:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full line-through opacity-50"
              style={{ background: `${aiColor}18`, color: aiColor }}>
              {riskLabel(item.ai_risk_level)}
            </span>
            <span className="text-gray-500 text-[10px]">→</span>
            <span className="text-[10px] text-gray-500">Doctor:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${docColor}22`, color: docColor }}>
              {riskLabel(item.doctor_override)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500">Overall risk:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${aiColor}20`, color: aiColor }}>
              {riskLabel(item.ai_risk_level)}
            </span>
          </div>
        )}
        {item.confidence !== null && (
          <span className="font-mono text-[11px] text-gray-500 shrink-0">
            {item.confidence}% confidence
          </span>
        )}
      </div>

      {/* Row 4: diagnosis snippet + date */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-800/60 flex-wrap">
        {item.diagnosis && (
          <p className="text-[11px] text-gray-500 truncate min-w-0 flex-1 italic">
            "{item.diagnosis}"
          </p>
        )}
        <span className="font-mono text-[10px] text-gray-600 shrink-0">
          {item.created_at ? formatDateTime(item.created_at) : '—'}
        </span>
      </div>
    </div>
  )
}