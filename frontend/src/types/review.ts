export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Prediction {
  disease_name: string
  probability: number
  risk_level: RiskLevel
}

export interface ShapValue {
  feature: string
  value: number | string
  impact: number
  effect: string
}

export interface AssessmentResult {
  predictions: Record<string, Prediction>
  risk_level: RiskLevel
  ensemble_confidence: number
  recommendations?: string[]
  models_used?: string
  shap_values?: ShapValue[]
}

export interface AssessmentParams {
  age?: number
  gender?: string
  weight?: number
  height?: number
  bmi?: number
  glucose?: number
  cholesterol?: number
  hemoglobin?: number
  wbc_count?: number
  creatinine?: number
  platelet_count?: number
  chest_pain_type?: string
  resting_ecg?: string
  resting_bp?: number
  st_slope?: string
  exercise_angina?: string
  fasting_bs?: number
  max_hr?: number
  oldpeak?: number
  smoking_status?: string
  alcohol_consumption?: string
  physical_activity?: string
  family_history?: string
  symptoms?: string
  [key: string]: unknown
}

export interface DoctorReview {
  report_id: string
  reviewed_at: string
  diagnosis: string
  recommendations: string
  follow_up_weeks: number
  risk_override: Partial<Record<string, RiskLevel>>
}

export interface ReviewItem {
  id: string
  patient_id: string
  patient_name: string | null
  created_at: string
  submitted_at?: string
  status: string
  params: AssessmentParams
  results?: AssessmentResult
  result?: AssessmentResult
  doctor_review: DoctorReview | null
  follow_ups: unknown[]
}

export interface ReviewForm {
  diagnosis: string
  recommendations: string
  follow_up_weeks: number
}

export interface ReviewFormErrors {
  diagnosis?: string
  recommendations?: string
}