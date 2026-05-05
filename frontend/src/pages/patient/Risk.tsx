// src/pages/patient/RiskFactors.tsx
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Card, { CardHeader } from '@/components/ui/Card'
import Spinner              from '@/components/ui/Spinner'
import EmptyState           from '@/components/common/EmptyState'
import { getShapValuesApi } from '@/services/patient.service'
import { getErrorMessage }  from '@/services/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ShapEntry {
  feature: string
  value:   number | string
  impact:  number
  effect:  'increases risk' | 'decreases risk'
}
interface ShapResponse {
  report_id:   string
  shap_values: ShapEntry[]
}

// ── Patient-friendly feature labels & explanations ────────────────────────────
// Maps raw ML feature names → plain English label + contextual description
const FEATURE_META: Record<string, {
  label:       string
  icon:        string
  riskNote:    (val: number | string) => string
  safeNote:    (val: number | string) => string
}> = {
  'ST Segment Slope': {
    label:    "Heart Signal Pattern",
    icon:     "📈",
    riskNote: () => "The shape of your heart's electrical signal during activity suggests your heart may be under strain.",
    safeNote: () => "Your heart's electrical signal pattern during activity looks normal.",
  },
  'ST Depression': {
    label:    "Heart Strain During Activity",
    icon:     "❤️",
    riskNote: (v) => `Your heart showed signs of stress during physical effort (value: ${v}). This can be an early warning sign worth investigating.`,
    safeNote: (v) => `Your heart handled physical effort well with minimal strain (value: ${v}).`,
  },
  'Fasting Blood Sugar': {
    label:    "Blood Sugar (Fasting)",
    icon:     "🩸",
    riskNote: (v) => `Your blood sugar level when fasting was ${v} mg/dL, which is above the healthy range and may be putting extra stress on your heart.`,
    safeNote: (v) => `Your fasting blood sugar was ${v} mg/dL, within a healthy range.`,
  },
  'Exercise-Induced Angina': {
    label:    "Chest Discomfort During Exercise",
    icon:     "🏃",
    riskNote: () => "You reported experiencing chest discomfort or pain during physical activity. This is a sign your heart may not be getting enough blood flow when working hard.",
    safeNote: () => "You did not experience chest discomfort during physical activity, which is a good sign.",
  },
  'Chest Pain Type': {
    label:    "Type of Chest Pain",
    icon:     "💢",
    riskNote: (v) => `Your chest pain was recorded as "${v}". This type of pain pattern is associated with higher cardiac risk and should be evaluated by a doctor.`,
    safeNote: (v) => `Your chest pain type ("${v}") is less likely to be related to a serious heart condition.`,
  },
  'Resting Blood Pressure': {
    label:    "Resting Blood Pressure",
    icon:     "🫀",
    riskNote: (v) => `Your resting blood pressure was ${v} mmHg, which is higher than the recommended range (under 120/80). Persistently high blood pressure strains the heart.`,
    safeNote: (v) => `Your resting blood pressure was ${v} mmHg, which is within an acceptable range.`,
  },
  'Maximum Heart Rate': {
    label:    "Peak Heart Rate During Exercise",
    icon:     "⚡",
    riskNote: (v) => `Your maximum heart rate during exercise was ${v} bpm. A lower-than-expected peak heart rate for your age can sometimes indicate reduced heart capacity.`,
    safeNote: (v) => `Your peak heart rate during exercise was ${v} bpm, appropriate for your age and activity level.`,
  },
  'Age': {
    label:    "Age",
    icon:     "🎂",
    riskNote: (v) => `At age ${v}, your natural risk for heart disease increases. This is not something you can change, but it makes regular checkups more important.`,
    safeNote: (v) => `Your age (${v}) places you in a lower natural risk category for heart disease.`,
  },
  'Resting ECG': {
    label:    "Heart Scan at Rest (ECG)",
    icon:     "📋",
    riskNote: (v) => `Your resting ECG result was "${v}". Even when a result appears normal, combined with other factors it can still contribute to overall risk.`,
    safeNote: (v) => `Your resting ECG result was "${v}", which is reassuring.`,
  },
  'Cholesterol': {
    label:    "Cholesterol Level",
    icon:     "🧪",
    riskNote: (v) => `Your cholesterol was ${v} mg/dL, which is above the healthy limit of 200 mg/dL. High cholesterol can cause fatty build-up in arteries over time.`,
    safeNote: (v) => `Your cholesterol level of ${v} mg/dL is within a manageable range.`,
  },
  'Gender': {
    label:    "Biological Sex",
    icon:     "👤",
    riskNote: (v) => `Your biological sex (${v}) is statistically associated with slightly higher cardiovascular risk in this model.`,
    safeNote: (v) => `Your biological sex (${v}) is associated with a lower statistical risk for heart disease in this model.`,
  },
}

function getMeta(feature: string) {
  return FEATURE_META[feature] ?? {
    label:    feature,
    icon:     '🔬',
    riskNote: (v: number | string) => `This factor (value: ${v}) is contributing to your risk score.`,
    safeNote: (v: number | string) => `This factor (value: ${v}) is helping lower your risk score.`,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RiskFactors() {
  const [data,    setData]    = useState<ShapResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getShapValuesApi()
      .then(setData)
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

  const shap = data?.shap_values ?? []

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">What's Affecting Your Health?</h1>
        <p className="page-sub">
          Based on your latest results, here's what our AI found to be helping or hurting your health
        </p>
      </div>

      {shap.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No data yet"
          description="Run a health analysis first to see your risk factors."
        />
      ) : (
        <RiskFactorContent shap={shap} />
      )}
    </div>
  )
}

// ── Content ───────────────────────────────────────────────────────────────────
function RiskFactorContent({ shap }: { shap: ShapEntry[] }) {
  const maxAbs = Math.max(...shap.map((s) => Math.abs(s.impact)))

  const elevating  = shap
    .filter((s) => s.effect === 'increases risk')
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))

  const protective = shap
    .filter((s) => s.effect === 'decreases risk')
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))

  const netImpact = shap.reduce((sum, s) => sum + s.impact, 0)
  const isNetRisk = netImpact > 0

  return (
    <div className="space-y-4">

      {/* TOP ROW: Summary + Ranked factors — equal height */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">

        {/* LEFT: Overall Summary */}
        <div className="flex flex-col gap-4 h-full">
          <Card className="!p-5 flex-1 flex flex-col">

            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Overall Summary
            </p>

            {/* Count boxes */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-rose-500/8 border border-rose-500/15 rounded-xl p-3 text-center">
                <p className="text-3xl font-black text-rose-400 leading-none">{elevating.length}</p>
                <p className="text-[10px] text-gray-400 mt-1">Raising risk</p>
              </div>
              <div className="bg-teal-500/8 border border-teal-500/15 rounded-xl p-3 text-center">
                <p className="text-3xl font-black text-teal-400 leading-none">{protective.length}</p>
                <p className="text-[10px] text-gray-400 mt-1">Protecting you</p>
              </div>
            </div>

            {/* Verdict */}
            <div
              className="rounded-xl px-4 py-3 mb-4"
              style={{
                background: isNetRisk ? 'rgba(255,95,126,0.07)' : 'rgba(0,212,168,0.07)',
                border:     `1px solid ${isNetRisk ? 'rgba(255,95,126,0.2)' : 'rgba(0,212,168,0.2)'}`,
              }}
            >
              <p
                className="text-[13px] font-semibold leading-snug mb-1"
                style={{ color: isNetRisk ? '#ff5f7e' : '#00d4a8' }}
              >
                {isNetRisk
                  ? 'More factors are raising your risk than protecting it.'
                  : 'Your protective factors are outweighing the risks.'}
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {isNetRisk
                  ? 'Some of your health readings need attention. Review the list below and discuss them with your doctor.'
                  : 'Your current health habits appear to be working. Keep them up and review flagged items with your doctor.'}
              </p>
            </div>

            {/* What to do next */}
            <div className="mt-auto pt-4 border-t border-gray-800/60">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                What to do next
              </p>
              <ul className="space-y-1.5">
                {[
                  'Share this report with your doctor at your next visit',
                  'Focus on the "Needs Attention" factors below',
                  'Keep up habits listed under "Working for You"',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-gray-400">
                    <span className="text-gray-600 mt-0.5 flex-shrink-0">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* RIGHT: Ranked factors — same height as left */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="!p-5 flex-1 flex flex-col">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
              Most Impactful Factors
            </p>
            <p className="text-[11px] text-gray-600 mb-4">
              Ranked by how much each factor influenced your result — top to bottom
            </p>

            <div className="flex-1 space-y-2.5">
              {shap
                .slice()
                .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
                .map((s, i) => {
                  const abs    = Math.abs(s.impact)
                  const barPct = maxAbs > 0 ? Math.round((abs / maxAbs) * 100) : 0
                  const isRisk = s.effect === 'increases risk'
                  const color  = isRisk ? '#ff5f7e' : '#00d4a8'
                  const meta   = getMeta(s.feature)
                  return (
                    <div key={`rank-${i}`} className="flex items-center gap-3">
                      {/* Rank + icon */}
                      <div className="flex items-center gap-2 flex-shrink-0 w-[22px]">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                          style={{ background: `${color}20`, color }}
                        >
                          {i + 1}
                        </span>
                      </div>

                      {/* Label + bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-gray-300 truncate">
                            {meta.icon} {meta.label}
                          </span>
                          <span
                            className="flex-shrink-0 ml-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: `${color}15`, color }}
                          >
                            {isRisk ? '⬆ Risk' : '⬇ Safe'}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${barPct}%`, background: color }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-800/50 flex gap-5 text-[10px] text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Raises risk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
                Lowers risk
              </span>
              <span className="flex items-center gap-1.5 ml-auto text-gray-600">
                Bar length = how much influence each factor had
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/*  NEEDS ATTENTION  */}
      {elevating.length > 0 && (
        <Card>
          <CardHeader
            title="🔴 Needs Attention"
            subtitle="These readings are pushing your risk higher — here's what each one means for you"
            action={
              <span className="text-[10px] font-semibold px-2 py-1 rounded bg-rose-500/10 text-rose-400">
                {elevating.length} factor{elevating.length !== 1 ? 's' : ''}
              </span>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {elevating.map((s, i) => {
              const abs    = Math.abs(s.impact)
              const barPct = maxAbs > 0 ? Math.round((abs / maxAbs) * 100) : 0
              const meta   = getMeta(s.feature)
              const isTop  = i === 0
              return (
                <div
                  key={`elev-${i}`}
                  className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl flex-shrink-0">{meta.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13px] font-semibold text-gray-100 leading-tight">
                            {meta.label}
                          </p>
                          {isTop && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-300 uppercase tracking-wide">
                              Most Impactful
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Recorded value: <span className="font-mono text-gray-300">{s.value}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Plain-English explanation */}
                  <p className="text-[12px] text-gray-300 leading-relaxed mb-3">
                    {meta.riskNote(s.value)}
                  </p>

                  {/* Influence bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                      <span>Influence on your result</span>
                      <span className="font-mono">{barPct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${barPct}%`, background: '#ff5f7e' }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* WORKING IN YOUR FAVOUR  */}
      {protective.length > 0 && (
        <Card>
          <CardHeader
            title="🟢 Working in Your Favour"
            subtitle="These readings are helping keep your risk lower — keep maintaining them"
            action={
              <span className="text-[10px] font-semibold px-2 py-1 rounded bg-teal-500/10 text-teal-400">
                {protective.length} factor{protective.length !== 1 ? 's' : ''}
              </span>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {protective.map((s, i) => {
              const abs    = Math.abs(s.impact)
              const barPct = maxAbs > 0 ? Math.round((abs / maxAbs) * 100) : 0
              const meta   = getMeta(s.feature)
              const isTop  = i === 0
              return (
                <div
                  key={`prot-${i}`}
                  className="rounded-xl border border-teal-500/10 bg-teal-500/5 p-4"
                >
                  <div className="flex items-start gap-2.5 mb-2">
                    <span className="text-xl flex-shrink-0">{meta.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-gray-100 leading-tight">
                          {meta.label}
                        </p>
                        {isTop && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500/25 text-teal-300 uppercase tracking-wide">
                            Strongest Protection
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Recorded value: <span className="font-mono text-gray-300">{s.value}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-[12px] text-gray-300 leading-relaxed mb-3">
                    {meta.safeNote(s.value)}
                  </p>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                      <span>Protective influence</span>
                      <span className="font-mono">{barPct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${barPct}%`, background: '#00d4a8' }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
        <span className="text-gray-500 text-base flex-shrink-0 mt-0.5">ℹ</span>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          These results are generated by an AI model trained on clinical data. They show which
          factors had the most influence on your predicted risk score and are{' '}
          <span className="text-gray-400 font-semibold">not a medical diagnosis</span>.
          Always discuss your results with a qualified doctor before making any health decisions.
        </p>
      </div>

    </div>
  )
}