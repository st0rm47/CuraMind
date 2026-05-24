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
import { riskColor, riskLabel, getInitials, KEY_MAP } from '@/utils/notesHelpers'
import type { DoctorNote, AiPrediction,   RiskOverride, DoctorProfile }     from '@/types/notes'

//Page component
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
    // FIX 1: w-full min-w-0 on root
    <div className="animate-fade-in space-y-5 w-full min-w-0">
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

// Note card 
function NoteCard({ note }: { note: DoctorNote }) {
  const doc             = note.doctor
  const hasOverrides    = Object.keys(note.risk_overrides).length > 0
  const predEntries     = Object.entries(note.ai_predictions)
  const overrideEntries = Object.entries(note.risk_overrides)

  return (
    <Card className="min-w-0 overflow-hidden">

      {/* Doctor profile header  */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5 sm:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#4da3ff,#00d4a8)' }}
          >
            {getInitials(doc?.name ?? null)}
          </div>

          {/* Doctor details */}
          <div className="min-w-0">
            <p className="font-bold text-[14px] sm:text-[15px] text-gray-100 truncate">
              {doc?.name ?? 'Unknown Physician'}
            </p>
            {doc?.speciality && (
              <p className="text-[12px] text-gray-400 truncate">{doc.speciality}</p>
            )}
            {doc?.license_number && (
              <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                License: {doc.license_number}
              </p>
            )}
          </div>
        </div>

        <span className="tag tag-teal shrink-0 self-start">✓ Reviewed</span>
      </div>

      {/* Report timeline  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 sm:mb-6">
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

      {/*  AI Predictions + Doctor Risk Corrections */}
      {(predEntries.length > 0 || hasOverrides) && (
        // FIX 3: stacks to single col on mobile, side-by-side on lg+
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5 sm:mb-6 items-stretch">

          {/* LEFT: AI Predictions */}
          {predEntries.length > 0 && (
            <div className="flex flex-col rounded-2xl border border-gray-700/40 bg-gray-800/20 p-4 min-w-0">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 shrink-0">
                🤖 AI Predictions
              </p>
              
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 flex-1 content-start">
                {predEntries.map(([rawKey, pred]) => {
                  const key        = KEY_MAP[rawKey] ?? KEY_MAP[rawKey.toLowerCase()]
                  const meta       = key ? DISEASE_META[key] : null
                  const color      = riskColor(pred.risk_level)
                  const pct        = Math.round(pred.probability)
                  const overridden = note.risk_overrides[rawKey]

                  return (
                    <div
                      key={rawKey}
                      className="rounded-xl bg-gray-800/60 border border-gray-700/30 px-3 py-3 relative min-w-0"
                    >
                      {overridden && (
                        <div
                          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400"
                          title="Doctor overrode this prediction"
                        />
                      )}
                      <div className="flex items-center gap-1.5 mb-2 pr-4 min-w-0">
                        <span className="text-sm shrink-0">{meta?.icon ?? '🔬'}</span>
                        {/* FIX 5: truncate long disease names inside the small card */}
                        <span className="text-[11px] font-semibold text-gray-200 truncate leading-tight">
                          {meta?.name ?? pred.disease_name ?? rawKey}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[11px] text-gray-400 tabular-nums shrink-0">
                          {pct}%
                        </span>
                        {pred.risk_level && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full truncate"
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
              <p className="text-[9px] text-gray-600 mt-3 shrink-0 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                Dot indicates doctor issued a correction
              </p>
            </div>
          )}

          {/* RIGHT: Doctor Risk Corrections */}
          <div className="flex flex-col rounded-2xl border border-gray-700/40 bg-gray-800/20 p-4 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 shrink-0 flex-wrap">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                🩺 Doctor Risk Corrections
              </p>
              {hasOverrides && (
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 shrink-0">
                  {overrideEntries.length} override{overrideEntries.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {hasOverrides ? (
              <>
                <div className="space-y-2 flex-1">
                  {overrideEntries.map(([rawKey, override]) => {
                    const key      = KEY_MAP[rawKey] ?? KEY_MAP[rawKey.toLowerCase()]
                    const meta     = key ? DISEASE_META[key] : null
                    const aiColor  = riskColor(override.ai_risk)
                    const docColor = riskColor(override.doctor_risk)

                    return (
                      <div
                        key={rawKey}
                        // FIX 6: flex-wrap so the AI→Doctor badge row wraps on narrow screens
                        className="flex flex-wrap items-center gap-2 px-3 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15"
                      >
                        <span className="text-base shrink-0">{meta?.icon ?? '🔬'}</span>
                        <span className="text-[12px] font-semibold text-gray-200 flex-1 min-w-0 truncate">
                          {meta?.name ?? rawKey}
                        </span>
                        {/* Badge row — shrink-0 keeps them together */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full line-through opacity-50"
                            style={{ background: `${aiColor}18`, color: aiColor }}
                          >
                            {riskLabel(override.ai_risk)}
                          </span>
                          <span className="text-gray-600 text-[11px]">→</span>
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
                <p className="text-[9px] text-gray-600 mt-3 shrink-0 leading-relaxed">
                  Your doctor reviewed the classification of Heart Disease and updated the risk levels above
                  based on their clinical assessment.
                </p>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'rgba(0,212,168,0.1)' }}
                >
                  <span className="text-xl">✓</span>
                </div>
                <p className="text-[13px] font-semibold text-teal-400 mb-1">
                  No corrections made
                </p>
                <p className="text-[11px] text-gray-500 leading-relaxed max-w-[180px]">
                  Your doctor agreed with the classification of Heart Disease done by the AI.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-gray-800 mb-5 sm:mb-6" />

      {/* Clinical Diagnosis  */}
      {note.diagnosis && (
        <div
          className="bg-gray-800/50  p-4 mb-3 min-w-0"
          style={{ borderLeft: '3px solid #00d4a8' }}
        >
          <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-teal-400 mb-2">
            Clinical Diagnosis
          </p>
          {/* FIX 7: break-words on all long-text blocks */}
          <p className="text-[13px] text-gray-200 leading-relaxed break-words">
            {note.diagnosis}
          </p>
        </div>
      )}

      {/* Recommendations  */}
      {note.recommendations && (
        <div
          className="bg-gray-800/50  p-4 mb-3 min-w-0"
          style={{ borderLeft: '3px solid #4da3ff' }}
        >
          <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-blue-400 mb-2">
            Treatment Recommendations
          </p>
          <p className="text-[13px] text-gray-200 leading-relaxed break-words">
            {note.recommendations}
          </p>
        </div>
      )}

      {/* Follow-up */}
      {note.follow_up_weeks != null && (
        <div
          className="bg-gray-800/50  p-4 mb-3 min-w-0"
          style={{ borderLeft: '3px solid #ffbe3d' }}
        >
          <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400 mb-2">
            Follow-Up Schedule
          </p>
          <p className="text-[13px] text-gray-200 leading-relaxed break-words">
            Return for a follow-up visit in{' '}
            <span className="font-semibold text-amber-300">
              {note.follow_up_weeks} week{note.follow_up_weeks !== 1 ? 's' : ''}
            </span>
            . Submit updated health parameters as directed by your doctor before the visit.
          </p>
        </div>
      )}

    </Card>
  )
}