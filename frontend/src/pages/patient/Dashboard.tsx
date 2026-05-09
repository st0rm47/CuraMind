// src/pages/patient/Dashboard.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardApi } from '@/services/patient.service'
import { getErrorMessage } from '@/services/api'
import { formatFull, formatDateTime } from '@/utils/formatDate'
import { getRiskLevel, getRiskColor, DISEASE_META } from '@/components/common/riskUtils'
import Card, { CardHeader } from '@/components/ui/Card'
import StatCard             from '@/components/ui/StatCard'
import Button               from '@/components/ui/Button'
import { RiskBadge }        from '@/components/ui/Badge'
import ProgressBar          from '@/components/ui/ProgressBar'
import Spinner              from '@/components/ui/Spinner'
import Timeline             from '@/components/common/Timeline'
import type { DiseaseKey }  from '@/types/report'
import type { DashboardResponse, DashboardLatest } from '@/types/dashboard'

// ─── helpers ──────────────────────────────────────────────────────────────────

function normaliseConfidence(raw: number): number {
  if (raw <= 1) return Math.round(raw * 100)
  return Math.round(raw)
}

function normalisePct(raw: number): number {
  if (raw <= 1) return Math.round(raw * 100)
  return Math.round(raw)
}

function getConfidenceAccent(pct: number): 'rose' | 'amber' | 'teal' {
  if (pct >= 70) return 'rose'
  if (pct >= 40) return 'amber'
  return 'teal'
}

function flattenRecommendations(
  rec: DashboardLatest['result']['recommendations'],
): string[] {
  if (!rec) return []
  if (Array.isArray(rec)) return rec.filter(Boolean)
  return Object.values(rec as Record<string, string | string[]>)
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .filter(Boolean)
}

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

// ─── component ────────────────────────────────────────────────────────────────

export default function PatientDashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [data,    setData]    = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardApi()
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

  const latest     = data?.latest ?? null
  const activity   = data?.activity ?? []
  const totalCount = data?.total_assessments ?? 0

  const rawPreds = latest?.result?.predictions ?? null
  const preds: Record<DiseaseKey, number> | null = rawPreds
    ? (Object.fromEntries(
        Object.entries(rawPreds)
          .map(([k, v]) => [KEY_MAP[k] ?? KEY_MAP[k.toLowerCase()], v])
          .filter(([k]) => k !== undefined),
      ) as Record<DiseaseKey, number>)
    : null

  const topRisks: [DiseaseKey, number][] = preds
    ? (Object.entries(preds) as [DiseaseKey, number][])
        .map(([k, v]) => [k, normalisePct(v)] as [DiseaseKey, number])
        .sort((a, b) => b[1] - a[1])
    : []

  const topRisk    = topRisks[0] ?? null
  const topDiseaseName = topRisk
  ? (DISEASE_META[topRisk[0]]?.name ?? topRisk[0])
  : '—'

  const topDiseaseRiskLevel =latest?.result?.risk_level?.toUpperCase() ?? '—'
  const confidence = latest ? normaliseConfidence(latest.result.ensemble_confidence) : null

  const modelsArray: string[] = latest?.result?.models_used
    ? Array.isArray(latest.result.models_used)
      ? latest.result.models_used
      : [String(latest.result.models_used)]
    : []

  // Recommendations straight from the report — no synthetic keyword mapping
  const flatRecs = latest ? flattenRecommendations(latest.result.recommendations) : []

  const bmi = latest ? (latest.result.bmi ?? latest.params.bmi) : 0

  const vitals = latest
    ? [
        {
          label:  'Blood Glucose',
          value:  `${latest.params.glucose} mg/dL`,
          pct:    Math.min(100, Math.max(0, Math.round(((latest.params.glucose - 70) / 130) * 100))),
          status: latest.params.glucose >= 126 ? 'HIGH' : latest.params.glucose >= 100 ? 'BORDERLINE' : 'NORMAL',
          color:  latest.params.glucose >= 126 ? '#ff5f7e' : latest.params.glucose >= 100 ? '#ffbe3d' : '#00d4a8',
        },
        {
          label:  'Blood Pressure',
          value:  `${latest.params.resting_bp} mmHg`,
          pct:    Math.min(100, Math.max(0, Math.round(((latest.params.resting_bp - 90) / 90) * 100))),
          status: latest.params.resting_bp >= 130 ? 'HIGH' : latest.params.resting_bp >= 120 ? 'BORDERLINE' : 'NORMAL',
          color:  latest.params.resting_bp >= 130 ? '#ff5f7e' : latest.params.resting_bp >= 120 ? '#ffbe3d' : '#00d4a8',
        },
        {
          label:  'Max Heart Rate',
          value:  `${latest.params.max_hr} bpm`,
          pct:    Math.min(100, Math.max(0, Math.round(((latest.params.max_hr - 60) / 160) * 100))),
          status: latest.params.max_hr >= 200 ? 'HIGH' : latest.params.max_hr >= 180 ? 'BORDERLINE' : 'NORMAL',
          color:  latest.params.max_hr >= 200 ? '#ff5f7e' : latest.params.max_hr >= 180 ? '#ffbe3d' : '#00d4a8',
        },
        {
          label:  'Cholesterol',
          value:  `${latest.params.cholesterol} mg/dL`,
          pct:    Math.min(100, Math.max(0, Math.round(((latest.params.cholesterol - 100) / 200) * 100))),
          status: latest.params.cholesterol >= 240 ? 'HIGH' : latest.params.cholesterol >= 200 ? 'BORDERLINE' : 'NORMAL',
          color:  latest.params.cholesterol >= 240 ? '#ff5f7e' : latest.params.cholesterol >= 200 ? '#ffbe3d' : '#00d4a8',
        },
        {
          label:  'Hemoglobin',
          value:  `${latest.params.hemoglobin} g/dL`,
          pct:    Math.min(100, Math.max(0, Math.round(((latest.params.hemoglobin - 5) / 15) * 100))),
          status: latest.params.hemoglobin < 12 ? 'HIGH' : latest.params.hemoglobin < 13.5 ? 'BORDERLINE' : 'NORMAL',
          color:  latest.params.hemoglobin < 12 ? '#ff5f7e' : latest.params.hemoglobin < 13.5 ? '#ffbe3d' : '#00d4a8',
        },
        {
          label:  'Creatinine',
          value:  `${latest.params.creatinine} mg/dL`,
          pct:    Math.min(100, Math.max(0, Math.round(((latest.params.creatinine - 0.5) / 2) * 100))),
          status: latest.params.creatinine > 1.2 ? 'HIGH' : latest.params.creatinine < 0.6 ? 'BORDERLINE' : 'NORMAL',
          color:  latest.params.creatinine > 1.2 ? '#ff5f7e' : latest.params.creatinine < 0.6 ? '#ffbe3d' : '#00d4a8',
        },
      ]
    : []

  // Timeline capped at 5 total items
  const timelineItems = latest
    ? [
        {
          date:  formatDateTime(latest.submitted_at),
          title: 'AI analysis complete',
          body:  `${topRisks.length} disease risk scores generated. Confidence: ${confidence}%.`,
          type:  'success' as const,
        },
        {
          date:  formatDateTime(latest.submitted_at),
          title: 'Health parameters submitted',
          body:  'Vitals, blood panel, and lifestyle data recorded.',
          type:  'default' as const,
        },
        {
          date:  latest.status === 'reviewed'
            ? formatDateTime(latest.doctor_review?.reviewed_at ?? latest.submitted_at)
            : 'Pending',
          title: latest.status === 'reviewed' ? 'Doctor review received' : 'Awaiting doctor review',
          body:  latest.status === 'reviewed'
            ? `${latest.doctor_review?.doctor_name ?? 'Doctor'} provided diagnosis.`
            : 'Case queued for physician review.',
          type: latest.status === 'reviewed' ? ('success' as const) : ('warning' as const),
        },
        ...activity.slice(1, 3).map((item) => ({
          date:  formatDateTime(item.submitted_at),
          title: 'Previous assessment',
          body:  `Overall risk: ${item.risk_level} · Confidence: ${normaliseConfidence(item.confidence)}%`,
          type:  'default' as const,
        })),
      ].slice(0, 5)
    : []

  return (
    <div className="animate-fade-in space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">{formatFull()}</p>
        </div>
        {/* {latest && (
          // <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          //   <span className={`inline-block w-2 h-2 rounded-full ${
          //     latest.status === 'reviewed' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
          //   }`} />
          //   {latest.status === 'reviewed' ? 'Doctor reviewed' : 'Pending review'}
          // </div>
        )} */}
      </div>

      {/* CTA — no assessment yet */}
      {!latest && (
        <Card accent className="!p-6">
          <div className="flex items-center gap-5">
            <span className="text-5xl select-none">🏥</span>
            <div>
              <h2 className="text-lg font-bold mb-2">Start Your Health Assessment</h2>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed max-w-md">
                Enter your health parameters to receive AI-powered disease risk predictions,
                explainable insights, and a queue for doctor review.
              </p>
              <Button variant="primary" onClick={() => navigate('/patient/healthinput')}>
                Begin Assessment →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Assessments"
          value={totalCount > 0 ? String(totalCount) : '—'}
          icon="📋"
          accent="blue"
          note={latest ? `Last: ${formatDateTime(latest.submitted_at)}` : 'No assessments yet'}
        />
        <StatCard
          label="Top Risk"
          value={topDiseaseName}
          icon="🎯"
          accent="teal"
          note={
            topRisk
              ? `Risk Level: ${topDiseaseRiskLevel}`
              : 'No risks identified'
          }
        />
        <StatCard
          label="Models Run"
          value={modelsArray.length > 0 ? String(modelsArray.length) : '—'}
          icon="🤖"
          accent="rose"
          note={modelsArray.length ? modelsArray.join(' · ') : 'Ensemble · multiple algorithms'}
        />
        <StatCard
          label="Confidence"
          value={confidence !== null ? `${confidence}%` : '—'}
          icon="⚡"
          accent={confidence !== null ? getConfidenceAccent(confidence) : 'amber'}
          note={
            confidence !== null
              ? confidence >= 70
                ? '⚠ High risk signal'
                : confidence >= 40
                ? 'Moderate signal'
                : 'Low risk signal'
              : 'Ensemble score'
          }
        />
      </div>

      {/* Main 2-column grid */}
      {latest && preds && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Risk Overview — no Full Report button */}
          {/* <Card>
            <CardHeader
              title="Risk Overview"
              subtitle={`${topRisks.length} disease categories analysed`}
            />
            <div className="space-y-2 mt-1">
              {topRisks.slice(0, 6).map(([disease, pct]) => {
                const level = getRiskLevel(pct)
                const color = getRiskColor(level)
                const meta  = DISEASE_META[disease]
                return (
                  <div key={disease}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300 flex items-center gap-1.5">
                        <span>{meta?.icon ?? '•'}</span>
                        <span className="font-medium">{meta?.name ?? disease}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${color}22`, color }}
                        >
                          {level.toUpperCase()}
                        </span>
                        <span className="font-mono text-[12px] text-gray-400 w-8 text-right tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <ProgressBar label="" value={pct} color={color} />
                  </div>
                )
              })}
            </div>
          </Card> */}

          {/* Health Indicators — replaces Radar */}
          <Card>
            <CardHeader
              title="Health Indicators"
              subtitle="Clinical reference ranges"
            />
            <div className="space-y-2.5 mt-1">
              {vitals.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {/* <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${item.color}18`, color: item.color }}
                      >
                        {item.status}
                      </span> */}
                      <span className="font-mono text-[12px] text-gray-400 tabular-nums">
                        {item.value}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Lifestyle snapshot */}
            <div className="mt-4 pt-4 border-t border-gray-800/60">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Lifestyle Snapshot
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {([
                  { label: 'Smoking',   value: latest.params.smoking_status },
                  { label: 'Alcohol',   value: latest.params.alcohol_consumption },
                  { label: 'Activity',  value: latest.params.physical_activity },
                  { label: 'Family History', value: latest.params.family_history },
                ] as const).map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-gray-800/50 rounded-lg px-3 py-2 flex flex-col gap-0.5"
                  >
                    <span className="text-[9px] text-gray-500 uppercase tracking-wide">{label}</span>
                    <span className="text-[12px] font-medium text-gray-200 capitalize">
                      {String(value).replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Activity — max 5 items */}
          <Card>
            <CardHeader
              title="Recent Activity"
              subtitle={totalCount > 1 ? `${totalCount} total assessments` : undefined}
            />
            <Timeline items={timelineItems} />
          </Card>

          {/* Doctor Review or Pending placeholder
          {latest.status === 'reviewed' && latest.doctor_review ? (
            <Card>
              <CardHeader
                title="🩺 Doctor Review"
                subtitle={`By ${latest.doctor_review.doctor_name ?? 'your physician'} · ${formatDateTime(latest.doctor_review.reviewed_at)}`}
              />
              <div className="space-y-4 mt-1">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Diagnosis
                  </p>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {latest.doctor_review.diagnosis}
                  </p>
                </div>
                {latest.doctor_review.recommendations && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Doctor's Recommendations
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {latest.doctor_review.recommendations}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader title="🩺 Doctor Review" subtitle="Pending physician review" />
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">
                    Awaiting physician review
                  </p>
                  <p className="text-xs text-gray-500 max-w-[220px] leading-relaxed">
                    Your report has been queued. A doctor will review your results and provide a diagnosis soon.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  In queue
                </div>
              </div>
            </Card>
          )} */}
        </div>
      )}

      {/* AI Recommendations — real data from report, numbered list */}
      {latest && flatRecs.length > 0 && (
        <Card>
          <CardHeader
            title="💡 AI Health Recommendations"
            subtitle={`${flatRecs.length} recommendations based on your risk profile`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
            {flatRecs.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-gray-800/40 rounded-xl px-4 py-3 border border-gray-700/30"
              >
                <span
                  className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: confidence !== null && confidence >= 70 ? '#ff5f7e22' : '#4da3ff22',
                    color:      confidence !== null && confidence >= 70 ? '#ff5f7e'   : '#4da3ff',
                  }}
                >
                  {i + 1}
                </span>
                <p className="text-[12px] text-gray-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  )
}