// src/types/dashboard.ts
// Types that exactly match the /patient/dashboard response shape


import type { DiseaseKey, RiskLevel, AssessmentStatus } from './report'

export interface DashboardParams {
  age:              number
  gender:           string
  weight:           number
  height:           number
  bmi:              number
  glucose:          number
  cholesterol:      number
  hemoglobin:       number
  wbc_count:        number
  creatinine:       number
  platelet_count:   number
  chest_pain_type:  string
  resting_ecg:      string
  resting_bp:       number
  st_slope:         string
  exercise_angina:  string
  fasting_bs:       number
  max_hr:           number
  oldpeak:          number
  smoking_status:   string
  alcohol_consumption:   string
  physical_activity:    string
  family_history:   string
  symptoms:         string
}

export interface DashboardResult {
  predictions:         Record<DiseaseKey, number>   // { diabetes: 0.72, ... }
  risk_level:          RiskLevel
  shap_values:         unknown[]
  ensemble_confidence: number                        // 0–100 or 0–1 (see note below)
  recommendations:     Record<string, string[]> | string[]
  models_used:         string[]
  bmi:                 number
}

export interface DashboardDoctorReview {
  doctor_name:     string | null
  reviewed_at:     string
  diagnosis:       string
  recommendations: string
}

export interface DashboardLatest {
  latest_followup: any
  followup_submitted: any
  follow_ups: any
  id:            string
  submitted_at:  string
  status:        AssessmentStatus
  risk_level:   RiskLevel
  params:        DashboardParams
  result:        DashboardResult
  doctor_review: DashboardDoctorReview | null
}

export interface DashboardActivity {
  id:           string
  submitted_at: string
  risk_level:   RiskLevel
  confidence:   number
  status:       AssessmentStatus
}

export interface DashboardResponse {
  latest:            DashboardLatest | null
  activity:          DashboardActivity[]
  total_assessments: number
}