// ── Types ─────────────────────────────────────────────────────────────────────
export  interface AiPrediction {
  disease_name: string
  probability:  number
  risk_level:   string | null
}

export interface RiskOverride {
  ai_risk:     string | null
  doctor_risk: string
}

export interface DoctorProfile {
  id:             string | null
  name:           string | null
  speciality:     string | null
  license_number: string | null
  email:          string | null
}

export interface DoctorNote {
  report_id:       string
  submitted_at:    string
  reviewed_at:     string | null
  overall_risk:    string
  confidence:      number | null
  doctor:          DoctorProfile | null
  ai_predictions:  Record<string, AiPrediction>
  risk_overrides:  Record<string, RiskOverride>
  diagnosis:       string | null
  recommendations: string | null
  follow_up_weeks: number | null
}

export interface DoctorNotesResponse {
  notes: DoctorNote[]
  total: number
}