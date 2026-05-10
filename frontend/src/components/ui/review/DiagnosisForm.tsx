// src/components/ui/review/DiagnosisForm.tsx
import type { ReviewForm, ReviewFormErrors } from '@/types/review'

interface Props {
  form:       ReviewForm
  errors:     ReviewFormErrors
  submitting: boolean
  onChange:   (updates: Partial<ReviewForm>) => void
  onSubmit:   () => void
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1px solid ${hasError ? '#E05C30' : 'rgba(255,255,255,0.1)'}`,
  background: hasError ? 'rgba(224,92,48,0.05)' : 'rgba(255,255,255,0.04)',
  color: '#e5e7eb', fontSize: 13, outline: 'none',
  transition: 'border-color 0.15s, background 0.15s', boxSizing: 'border-box' as const,
})

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca3af',
  letterSpacing: '0.05em', textTransform: 'uppercase' as const,
  marginBottom: 6, fontFamily: 'monospace',
}

const errorStyle: React.CSSProperties = {
  marginTop: 5, fontSize: 11, color: '#E05C30',
  display: 'flex', alignItems: 'center', gap: 4,
}

export default function DiagnosisForm({ form, errors, submitting, onChange, onSubmit }: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden min-w-0">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 sm:px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
          style={{ background: 'rgba(167,139,250,0.15)' }}>
          🩺
        </div>
        <p className="text-[14px] font-bold text-gray-100 m-0">
          Doctor's Diagnosis & Recommendations
        </p>
      </div>

      {/* Form body */}
      <div className="flex flex-col gap-5 p-4 sm:p-5">

        {/* Clinical diagnosis */}
        <div>
          <label style={labelStyle}>Clinical Diagnosis *</label>
          <input
            type="text"
            placeholder="Pre-diabetic (IFG), Stage 1 hypertension, metabolic syndrome…"
            value={form.diagnosis}
            onChange={(e) => onChange({ diagnosis: e.target.value })}
            style={inputStyle(!!errors.diagnosis)}
            onFocus={(e) => {
              e.target.style.borderColor = errors.diagnosis ? '#E05C30' : 'rgba(77,163,255,0.5)'
              e.target.style.background  = errors.diagnosis ? 'rgba(224,92,48,0.05)' : 'rgba(77,163,255,0.04)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.diagnosis ? '#E05C30' : 'rgba(255,255,255,0.1)'
              e.target.style.background  = errors.diagnosis ? 'rgba(224,92,48,0.05)' : 'rgba(255,255,255,0.04)'
            }}
          />
          {errors.diagnosis && <p style={errorStyle}>⚠ {errors.diagnosis}</p>}
        </div>

        {/* Recommendations */}
        <div>
          <label style={labelStyle}>Treatment Recommendations *</label>
          <textarea
            placeholder="Detailed recommendations including medication, lifestyle changes, required tests, referrals, follow-up plans…"
            value={form.recommendations}
            rows={5}
            onChange={(e) => onChange({ recommendations: e.target.value })}
            style={{ ...inputStyle(!!errors.recommendations), resize: 'vertical', lineHeight: 1.6, minHeight: 120 }}
            onFocus={(e) => {
              e.target.style.borderColor = errors.recommendations ? '#E05C30' : 'rgba(77,163,255,0.5)'
              e.target.style.background  = errors.recommendations ? 'rgba(224,92,48,0.05)' : 'rgba(77,163,255,0.04)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.recommendations ? '#E05C30' : 'rgba(255,255,255,0.1)'
              e.target.style.background  = errors.recommendations ? 'rgba(224,92,48,0.05)' : 'rgba(255,255,255,0.04)'
            }}
          />
          {errors.recommendations && <p style={errorStyle}>⚠ {errors.recommendations}</p>}
        </div>

        {/* Follow-up weeks — FIX 1: week buttons wrap on mobile */}
        <div>
          <label style={labelStyle}>Follow-Up Period</label>
          {/* FIX 2: flex-wrap so all 5 week buttons + custom input wrap cleanly */}
          <div className="flex flex-wrap items-center gap-2">
            {[2, 4, 6, 8, 12].map((w) => (
              <button
                key={w}
                onClick={() => onChange({ follow_up_weeks: w })}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  border:      form.follow_up_weeks === w ? '1.5px solid #4da3ff' : '1px solid rgba(255,255,255,0.1)',
                  background:  form.follow_up_weeks === w ? 'rgba(77,163,255,0.12)' : 'rgba(255,255,255,0.03)',
                  color:       form.follow_up_weeks === w ? '#4da3ff' : '#9ca3af',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s', fontFamily: 'monospace',
                }}
              >
                {w}w
              </button>
            ))}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={52}
                value={form.follow_up_weeks}
                onChange={(e) => onChange({ follow_up_weeks: Math.max(1, Math.min(52, +e.target.value)) })}
                style={{
                  width: 56, padding: '6px 8px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                  color: '#e5e7eb', fontSize: 12, fontFamily: 'monospace',
                  textAlign: 'center', outline: 'none',
                }}
              />
              <span style={{ fontSize: 12, color: '#6b7280' }}>weeks</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

        {/* Submit — FIX 3: full-width on mobile */}
        <div>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold text-white transition-all"
            style={{
              border: 'none',
              background:  submitting ? 'rgba(0,212,168,0.3)' : 'linear-gradient(135deg, #00b38a, #00d4a8)',
              cursor:      submitting ? 'not-allowed' : 'pointer',
              boxShadow:   submitting ? 'none' : '0 4px 20px rgba(0,212,168,0.25)',
            }}
            onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
          >
            {submitting ? (
              <>
                <span style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                  animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
                Saving…
              </>
            ) : (
              <>💾 Save & Notify Patient</>
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}