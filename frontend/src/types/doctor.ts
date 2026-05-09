// src/types/doctor.ts

import type { Assessment, Predictions, DiseaseKey} from './report'

export interface DoctorQueueResponse {
  items:  Assessment[]
  total:  number
  page:   number
  limit:  number
  pages:  number
}



// Shared case shape (used in queue + dashboard) 
export interface DoctorCaseResult {
  predictions:         Record<string, number>  // normalised 0-100, camelCase keys
  risk_level:          string
  ensemble_confidence: number
  models_used:         string[]
}

export interface DoctorCase {
  id:           string
  submitted_at: string
  status:       'pending' | 'reviewed' | 'archived'
  risk_level:   string
  patient_id:   string
  patient_name: string
  result:       DoctorCaseResult
  doctor_review: {
    doctor_name: string | null
    reviewed_at: string
    diagnosis:   string
  } | null
}

// ── Queue (paginated) ─────────────────────────────────────────────────────────
export interface DoctorQueueResponse {
  items:  DoctorCase[]
  total:  number
  page:   number
  limit:  number
  pages:  number
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface DashboardStats {
  total_assessments:  number
  pending:     number
  reviewed:           number
  high_risk_patients: number
}

export interface DoctorDashboardResponse {
  stats:           DashboardStats
  pending_cases:   DoctorCase[]
  recent_reviewed: DoctorCase[]
  average_risks:   Record<DiseaseKey, number>
}

// ── Analytics (kept for other pages that still use getAnalyticsApi) ───────────
export interface AnalyticsSummary {
  total_assessments:  number
  pending:     number
  reviewed:           number
  high_risk_patients: number
  average_risks:      Record<DiseaseKey, number>
}

// ── Corrections ───────────────────────────────────────────────────────────────
export interface CorrectionRecord {
  review_id:       string
  report_id:   string
  patient_name:    string
  doctor_name:     string
  disease:         string
  ai_score:        number
  doctor_override: string
  reviewed_at:     string
}

export interface CorrectionsResponse {
  corrections: CorrectionRecord[]
  total:       number
}

// ── Notifications ─────────────────────────────────────────────────────────────
export interface Notification {
  id:             string
  type:           'doctor_review' | 'followup_reminder' | 'new_assessment' | 'followup_submitted' | 'system'
  title:          string
  message:        string
  action_page?:   string
  report_id?: string
  is_read:        boolean
  timestamp:      string
}

export interface NotifCountResponse {
  unread_count: number
}