export interface AdminStats {
  total_users:             number
  patient_count:           number
  doctor_count:            number
  admin_count:             number
  new_patients_this_month: number
  new_doctors_this_month:  number
  total_assessments:       number
  pending_assessments:     number
  reviewed_assessments:    number
  high_risk_count:         number
}

export interface Doctor {
  id:             string
  name:           string
  email:          string
  speciality:     string | null
  license_number: string | null
  phone:          string | null
  created_at:     string | null
  total_reviews:  number
  is_active:      boolean
}

export interface Patient {
  id:                string
  name:              string
  email:             string
  phone:             string | null
  created_at:        string | null
  total_assessments: number
  latest_risk:       string | null
}

export interface RegisterDoctorForm {
  name:           string
  email:          string
  password:       string
  speciality:     string
  license_number: string
  phone:          string
  dob:            string
  gender:         string
}

export type Tab = 'overview' | 'doctors' | 'patients'

export const GENDER_OPTS = [
  { value: 'male',   label: 'Male'   },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other'  },
]