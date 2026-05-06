import type { AssessmentParams, AssessmentResult, RiskLevel } from '@/types/review'

// ─── Risk config ──────────────────────────────────────────────────────────────

export const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; color: string; bg: string; border: string; barColor: string }
> = {
  low:      { label: 'Low',      color: '#1D9E75', bg: 'rgba(29,158,117,0.10)',  border: 'rgba(29,158,117,0.25)',  barColor: '#1D9E75' },
  medium: { label: 'Medium', color: '#E8A020', bg: 'rgba(232,160,32,0.10)',  border: 'rgba(232,160,32,0.25)',  barColor: '#E8A020' },
  high:     { label: 'High',     color: '#E05C30', bg: 'rgba(224,92,48,0.10)',   border: 'rgba(224,92,48,0.25)',   barColor: '#E05C30' },
  critical: { label: 'Critical', color: '#E03030', bg: 'rgba(224,48,48,0.10)',   border: 'rgba(224,48,48,0.30)',   barColor: '#E03030' },
}

export function getRiskConfig(level: string) {
  return RISK_CONFIG[(level ?? 'low').toLowerCase() as RiskLevel] ?? RISK_CONFIG.low
}

// ─── Normalize results field ──────────────────────────────────────────────────

export function getResults(item: { results?: AssessmentResult; result?: AssessmentResult }): AssessmentResult | null {
  return item.results ?? item.result ?? null
}

// ─── Gender display ───────────────────────────────────────────────────────────

export function genderLabel(g?: string): string {
  if (!g) return '—'
  const lower = g.toLowerCase()
  if (lower === 'm' || lower === 'male')   return 'Male'
  if (lower === 'f' || lower === 'female') return 'Female'
  return g
}

// ─── Build a flat display list from params ────────────────────────────────────

export interface ParamRow {
  label: string
  value: string
  unit?: string
  group: 'vitals' | 'labs' | 'cardiac' | 'lifestyle'
  icon: string
}

export function buildParamRows(params: AssessmentParams): ParamRow[] {
  const rows: ParamRow[] = []

  const push = (
    label: string,
    raw: unknown,
    unit: string,
    group: ParamRow['group'],
    icon: string,
    transform?: (v: unknown) => string,
  ) => {
    if (raw == null || raw === '') return
    const value = transform ? transform(raw) : String(raw)
    rows.push({ label, value, unit, group, icon })
  }

  // Vitals
  push('Age',              params.age,             'yrs',   'vitals',    '🎂')
  push('Gender',           params.gender,          '',      'vitals',    '👤', genderLabel)
  push('Weight',           params.weight,          'kg',    'vitals',    '⚖️')
  push('Height',           params.height,          'cm',    'vitals',    '📏')
  push('BMI',              params.bmi,             '',      'vitals',    '📊')
  push('Resting BP',       params.resting_bp,      'mmHg',  'vitals',    '🩺')
  push('Max Heart Rate',   params.max_hr,          'bpm',   'vitals',    '💓')

  // Labs
  push('Glucose',          params.glucose,         'mg/dL', 'labs',      '🩸')
  push('Fasting BS',       params.fasting_bs,      'mg/dL', 'labs',      '🍬')
  push('Cholesterol',      params.cholesterol,     'mg/dL', 'labs',      '💉')
  push('Hemoglobin',       params.hemoglobin,      'g/dL',  'labs',      '🔬')
  push('WBC Count',        params.wbc_count,       '/µL',   'labs',      '🧫', (v) => Number(v).toLocaleString())
  push('Creatinine',       params.creatinine,      'mg/dL', 'labs',      '🧪')
  push('Platelet Count',   params.platelet_count,  '/µL',   'labs',      '🩸', (v) => Number(v).toLocaleString())

  // Cardiac
  push('Chest Pain Type',  params.chest_pain_type, '',      'cardiac',   '🫀')
  push('Resting ECG',      params.resting_ecg,     '',      'cardiac',   '📈')
  push('ST Slope',         params.st_slope,        '',      'cardiac',   '〰️')
  push('Exercise Angina',  params.exercise_angina, '',      'cardiac',   '🏃')
  push('ST Depression',    params.oldpeak,         '',      'cardiac',   '📉')

  // Lifestyle
  push('Smoking Status',   params.smoking_status,      '', 'lifestyle',  '🚬')
  push('Alcohol',          params.alcohol_consumption, '', 'lifestyle',  '🍷')
  push('Physical Activity',params.physical_activity,   '', 'lifestyle',  '🏋️')
  push('Family History',   params.family_history,      '', 'lifestyle',  '👨‍👩‍👧')

  return rows
}

// ─── Form validation ──────────────────────────────────────────────────────────

export function validateReviewForm(form: { diagnosis: string; recommendations: string }) {
  const errors: Record<string, string> = {}
  if (!form.diagnosis || form.diagnosis.trim().length < 5)
    errors.diagnosis = 'Enter a diagnosis (min 5 characters)'
  if (!form.recommendations || form.recommendations.trim().length < 10)
    errors.recommendations = 'Enter detailed recommendations (min 10 characters)'
  return errors
}