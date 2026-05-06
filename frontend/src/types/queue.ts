export type FilterStatus = 'all' | 'pending' | 'reviewed'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type DoctorReview = 'pending' | 'reviewed' | 'follow-up'
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

export interface QueueItem {
  id: string
  patient_id: string
  patient_name: string | null
  created_at: string
  submitted_at?: string
  status: string
  params: {
    age?: number
    gender?: string
    [key: string]: unknown
  }
  results?: AssessmentResult
  result?: AssessmentResult   // legacy field name fallback
  doctor_review: DoctorReview 
  follow_ups: unknown[]
}