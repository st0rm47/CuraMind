// src/pages/patient/DoctorNotes.tsx
import { useEffect, useState } from 'react'
import toast                   from 'react-hot-toast'
import Card, { CardHeader }    from '@/components/ui/Card'
import Spinner                 from '@/components/ui/Spinner'
import EmptyState              from '@/components/common/EmptyState'
import { getErrorMessage }     from '@/services/api'
import { getDoctorNotesApi }   from '@/services/patient.service'
import { formatDateTime }      from '@/utils/formatDate'
import { DISEASE_META }        from '@/components/common/riskUtils'
import type { DiseaseKey }     from '@/types/report'

// ── Types matching GET /patient/doctor-notes ──────────────────────────────────
interface AiPrediction {
  disease_name: string
  probability:  number       // 0-100
  risk_level:   string | null
}

interface RiskOverride {
  ai_risk:     string | null
  doctor_risk: string
}

interface DoctorProfile {
  id:             string | null
  name:           string | null
  speciality:     string | null
  license_number: string | null
  email:          string | null
}

interface DoctorNote {
  report_id:      string
  submitted_at:   string
  reviewed_at:    string | null
  overall_risk:   string
  confidence:     number | null
  doctor:         DoctorProfile | null
  ai_predictions: Record<string, AiPrediction>
  risk_overrides: Record<string, RiskOverride>
  diagnosis:      string | null
  recommendations: string | null
  follow_up_weeks: number | null
}

interface DoctorNotesResponse {
  notes: DoctorNote[]
  total: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// ML may store keys in snake_case — map to camelCase for DISEASE_META lookup
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

function getInitials(name: string | null): string {
  if (!name) return 'Dr'
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

// ── Service call (add to patient.service.ts) ──────────────────────────────────
// export async function getDoctorNotesApi(): Promise<DoctorNotesResponse> {
//   const { data } = await api.get<DoctorNotesResponse>('/patient/doctor-notes')
//   return data
// }

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DoctorNotes() {
  const [notes,   setNotes]   = useState<DoctorNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDoctorNotesApi()
      .then((res) => setNotes(res.notes))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="page-title">Doctor Notes</h1>
        <p className="page-sub">
          Clinical feedback and treatment recommendations from your physician
        </p>
      </div>

      {notes.length === 0 ? (
        <Card>
          <EmptyState
            icon="🩺"
            title="No reviews yet"
            description="Your doctor has not yet reviewed your assessment. You will receive a notification when they do."
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {notes.map((note) => (
            <NoteCard key={note.report_id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Note card ─────────────────────────────────────────────────────────────────
function NoteCard({ note }: { note: DoctorNote }) {
  const doc             = note.doctor
  const hasOverrides    = Object.keys(note.risk_overrides).length > 0
  const predEntries     = Object.entries(note.ai_predictions)
  const overrideEntries = Object.entries(note.risk_overrides)

  return (
    <Card>

      {/* ── Doctor profile header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#4da3ff,#00d4a8)' }}
          >
            {getInitials(doc?.name ?? null)}
          </div>

          {/* Doctor details */}
          <div>
            <p className="font-bold text-[15px] text-gray-100">
              {doc?.name ?? 'Unknown Physician'}
            </p>
            {doc?.speciality && (
              <p className="text-[12px] text-gray-400">{doc.speciality}</p>
            )}
            {doc?.license_number && (
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                License No: {doc.license_number}
              </p>
            )}
          </div>
        </div>

        {/* Reviewed badge */}
        <span className="tag tag-teal flex-shrink-0">✓ Reviewed</span>
      </div>

      {/* ── Report timeline ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
        <div className="bg-gray-800/50 rounded-xl px-4 py-3">
          <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
            Report Submitted
          </p>
          <p className="text-[13px] font-medium text-gray-200">
            {formatDateTime(note.submitted_at)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl px-4 py-3">
          <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
            Reviewed By Doctor
          </p>
          <p className="text-[13px] font-medium text-gray-200">
            {note.reviewed_at ? formatDateTime(note.reviewed_at) : '—'}
          </p>
        </div>
      </div>

      {/* ── AI Predictions + Doctor Risk Corrections — side by side ────────── */}
      {(predEntries.length > 0 || hasOverrides) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

          {/* AI Predictions */}
          {predEntries.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                AI Predictions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {predEntries.map(([rawKey, pred]) => {
                  const key      = KEY_MAP[rawKey] ?? KEY_MAP[rawKey.toLowerCase()]
                  const meta     = key ? DISEASE_META[key] : null
                  const color    = riskColor(pred.risk_level)
                  const pct      = Math.round(pred.probability)
                  const overridden = note.risk_overrides[rawKey]

                  return (
                    <div
                      key={rawKey}
                      className="rounded-xl bg-gray-800/40 border border-gray-700/30 px-3 py-3 relative"
                    >
                      {/* Amber dot = doctor overrode this */}
                      {overridden && (
                        <div
                          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400"
                          title="Doctor overrode this prediction"
                        />
                      )}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-base">{meta?.icon ?? '🔬'}</span>
                        <span className="text-[11px] font-semibold text-gray-200 truncate">
                          {meta?.name ?? pred.disease_name ?? rawKey}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-gray-400 tabular-nums">
                          {pct}%
                        </span>
                        {pred.risk_level && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: `${color}20`, color }}
                          >
                            {riskLabel(pred.risk_level)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Doctor Risk Corrections */}
          {hasOverrides ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Doctor Risk Corrections
                </p>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">
                  AI overridden
                </span>
              </div>
              <div className="space-y-2">
                {overrideEntries.map(([rawKey, override]) => {
                  const key      = KEY_MAP[rawKey] ?? KEY_MAP[rawKey.toLowerCase()]
                  const meta     = key ? DISEASE_META[key] : null
                  const aiColor  = riskColor(override.ai_risk)
                  const docColor = riskColor(override.doctor_risk)

                  return (
                    <div
                      key={rawKey}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15"
                    >
                      <span className="text-base flex-shrink-0">{meta?.icon ?? '🔬'}</span>
                      <span className="text-[13px] font-semibold text-gray-200 flex-1 min-w-0 truncate">
                        {meta?.name ?? rawKey}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full line-through opacity-60"
                          style={{ background: `${aiColor}18`, color: aiColor }}
                        >
                          {riskLabel(override.ai_risk)}
                        </span>
                        <span className="text-gray-600 text-xs">→</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${docColor}22`, color: docColor }}
                        >
                          {riskLabel(override.doctor_risk)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">
                Your doctor reviewed the AI predictions and updated the risk levels above
                based on their clinical assessment.
              </p>
            </div>
          ) : (
            /* No overrides — show a confirmation panel instead of blank space */
            predEntries.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Doctor Risk Corrections
                </p>
                <div className="h-full flex items-center justify-center rounded-xl bg-teal-500/5 border border-teal-500/15 px-4 py-8 text-center">
                  <div>
                    <p className="text-2xl mb-2">✓</p>
                    
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Your doctor agreed with all AI predictions.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

        </div>
      )}

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="h-px bg-gray-800 mb-6" />

      {/* Clinical Diagnosis */}
      {note.diagnosis && (
        <div
          className="bg-gray-800/50  p-4 mb-3"
          style={{ borderLeft: '3px solid #00d4a8' }}
        >
          <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-teal-400 mb-2">
            Clinical Diagnosis
          </p>
          <p className="text-[13px] text-gray-200 leading-relaxed">
            {note.diagnosis}
          </p>
        </div>
      )}

      {/* Recommendations */}
      {note.recommendations && (
        <div
          className="bg-gray-800/50  p-4 mb-3"
          style={{ borderLeft: '3px solid #4da3ff' }}
        >
          <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-blue-400 mb-2">
            Treatment Recommendations
          </p>
          <p className="text-[13px] text-gray-200 leading-relaxed">
            {note.recommendations}
          </p>
        </div>
      )}

      {/* Follow-up */}
      {note.follow_up_weeks != null && (
        <div
          className="bg-gray-800/50  p-4"
          style={{ borderLeft: '3px solid #ffbe3d' }}
        >
          <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400 mb-2">
            Follow-Up Schedule
          </p>
          <p className="text-[13px] text-gray-200 leading-relaxed">
            Return for a follow-up visit in{' '}
            <span className="font-semibold text-amber-300">
              {note.follow_up_weeks} week{note.follow_up_weeks !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
      )}

    </Card>
  )
}