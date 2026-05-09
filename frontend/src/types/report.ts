// src/types/report.ts

export type DiseaseKey =
  | 'diabetes'
  | 'hypertension'
  | 'heartDisease'
  | 'kidneyDisease'
  | 'liverDisease'
  | 'anemia'

export type RiskLevel   = 'low' | 'medium' | 'high' 
export type SmokingStatus = 'never' | 'former' | 'current'
export type AlcoholStatus = 'none' | 'occasional' | 'moderate' | 'high'
export type ExerciseLevel = 'none' | 'light' | 'moderate' | 'high'
export type FamilyHistory = 'none' | 'diabetes' | 'heart_disease' | 'both'
export type FeelingStatus = 'better' | 'same' | 'worse'
export type AssessmentStatus = 'pending' | 'reviewed' | 'archived'
export type ShapDirection    = 'risk' | 'protective'

export type Predictions = Record<DiseaseKey, number>

export interface HealthParams {
  age:            number
  gender:         string
  weight:         number    // kg
  height:         number    // cm
  glucose:        number    // mg/dL
  cholesterol:    number    // mg/dL
  hemoglobin:     number    // g/dL
  creatinine:     number    // mg/dL
  wbc_count:      number    // cells/μL
  platelet_count: number    // cells/μL
  smoking_status:        SmokingStatus
  alcohol_consumption:        AlcoholStatus
  physical_activity:       ExerciseLevel
  family_history: FamilyHistory
  symptoms:       string
  resting_bp:     number    // mmHg
  // 🫀 Heart disease specific fields (MISSING BEFORE)
  chest_pain_type: 'TA' | 'ATA' | 'NAP' | 'ASY'
  resting_ecg: 'Normal' | 'ST' | 'LVH'
  st_slope: 'Up' | 'Flat' | 'Down'
  exercise_angina: 'Y' | 'N'
  fasting_bs: number
  max_hr: number
  oldpeak: number

}

export interface ShapValue {
  feature:      string
  value:        number | string
  unit:         string
  impact:       number
  direction:    ShapDirection
  normal_range?: string
}
export interface PredictionResult {
  disease_name: string
  risk_level: "low" | "medium" | "high" 
  confidence: number
  recommendations: string[]
}
export interface DiseasePrediction {
  disease_name: string
  probability: number
  risk_level: RiskLevel
}

export interface ApiResponse {
  id: string

  predictions: Record<string, DiseasePrediction>

  risk_level: RiskLevel

  risk_percentage: number

  recommendations: string[]

  models_used: string

  created_at: string
}
export interface MLResult {
  predictions: Record<string, PredictionResult>
  shap_values?: any[]
  models_used: string[]
  ensemble_confidence: number
  preprocessing?: string
}

export interface DoctorReview {
  id?:             string
  doctor_id?:      string
  doctor_name?:    string
  reviewed_at:     string
  diagnosis:       string
  recommendations: string
  risk_override:  Partial<Record<DiseaseKey, RiskLevel>>
  follow_up_weeks: number
}

export interface DoctorReviewPayload {
  report_id:   string
  patient_id:      string
  diagnosis:       string
  recommendations: string
  risk_override:  Partial<Record<DiseaseKey, RiskLevel>>
  follow_up_weeks: number
}

export interface FollowUp {
  id?:            string
  report_id?: string
  glucose?:       number
  systolic_bp?:    number
  diastolic_bp?:   number
  weight?:        number
  feeling:        FeelingStatus
  symptoms:       string
  submitted_at?:  string
}

export interface Assessment {
  id:            string
  patient_id:    string
  patient_name?: string
  submitted_at:  string
  status:        AssessmentStatus
  params:        HealthParams
  result:        MLResult
  doctor_review: DoctorReview | null
  followups:     FollowUp[]
  predictions: Record<string, number>
  risk_level: string
  confidence: number

}

export interface PaginatedResponse<T> {
  items:  T[]
  total:  number
  page:   number
  limit:  number
  pages:  number
}
