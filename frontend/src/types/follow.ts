export interface DoctorReviewInfo {
  doctor_name: string | null;
  reviewed_at: string | null;
  follow_up_weeks: number | null;
  diagnosis: string | null;
}

export interface LatestReport {
  id: string;
  submitted_at: string | null;
  status: string;                      // "pending_review" | "reviewed"
  risk_level: string | null;
  doctor_review: DoctorReviewInfo | null;
  followup_cycle_active: boolean;      // true when doctor has reviewed
  followup_submitted: boolean;         // true when patient already submitted
  can_submit_followup: boolean;        // true = reviewed + not yet submitted
  latest_followup: PreviousFollowUp | null;
}

export interface PreviousFollowUp {
  id: string;
  glucose: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  weight: number | null;
  feeling: string;
  symptoms: string | null;
  submitted_at: string | null;
}

export interface FollowUpStatusResponse {
  latest_report: LatestReport | null;
  previous_followups: PreviousFollowUp[];
  can_submit_followup: boolean;
}

export interface FollowUpReport {
  id: string;
  risk_level: string | null;
  confidence: number | null;
  submitted_at: string | null;
  status: string | null;
}

export interface FollowUpPatient {
  id: string;
  name: string;
}

export interface FollowUpItem {
  id: string;
  submitted_at: string | null;
  glucose: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  weight: number | null;
  feeling: string;
  symptoms: string | null;
  report: FollowUpReport | null;
  patient: FollowUpPatient | null;
  reviewed_by: string | null;
}

export interface FollowUpsResponse {
  items: FollowUpItem[];
  total: number;
  page: number;
  pages: number;
}
