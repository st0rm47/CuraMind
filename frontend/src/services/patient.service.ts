// src/services/patient.service.ts
// All patient-facing API calls.

import api from './api'
import type {
  Assessment,
  HealthParams,
  FollowUp,
  PaginatedResponse,
  FeelingStatus,
} from '@/types/report'
import type { Notification, NotifCountResponse } from '@/types/doctor'
import { DashboardResponse } from '@/types/dashboard'

interface DoctorNotesResponse {
  notes: DoctorNote[]
  total: number
}
// ── Assessments ───────────────────────────────────────────────────────────────

/**
 * POST /patient/assess
 * Submits health parameters to the FastAPI backend which runs ML prediction.
 */
export async function submitAssessmentApi(params: HealthParams): Promise<Assessment> {
  const { data } = await api.post<Assessment>('/patient/assess', params)
  return data
}

/**
 * GET /patient/assessments?page=&limit=
 */
export async function getAssessmentsApi(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Assessment>> {
  const { data } = await api.get<PaginatedResponse<Assessment>>('/patient/assessments', {
    params: { page, limit },
  })
  return data
}

export async function getDashboardApi(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>('/patient/dashboard')
  return data
}
  
export async function getLatestAssessmentApi(): Promise<Assessment> {
  const { data } = await api.get<Assessment>('/patient/assessments/latest')
  return data
}

export const getShapValuesApi = async () => {
  const res = await api.get("/patient/assessments/latest/shap");
  return res.data;
};

// export async function getHistoryApi(
//   page = 1,
//   limit = 20,
// ): Promise<PaginatedResponse<Assessment>> {
//   const { data } = await api.get<PaginatedResponse<Assessment>>('/patient/history', {
//     params: { page, limit },
//   })
//   return data
// }

/**
 * POST /patient/followup/:assessment_id
 */
export async function submitFollowUpApi(
  assessmentId: string,
  payload: {
    glucose?:      number
    systolic_bp?:  number
    diastolic_bp?: number   // ← added
    weight?:       number
    feeling:       FeelingStatus
    symptoms?:     string
  },
): Promise<{ ok: boolean }> {
  const { data } = await api.post<{ ok: boolean }>(
    `/patient/followup/${assessmentId}`,
    payload,
  )
  return data
}

export async function getDoctorNotesApi(): Promise<DoctorNotesResponse> {
  const { data } = await api.get<DoctorNotesResponse>('/patient/doctor-notes')
  return data
}

// Notifications 

/** GET /notifications */
export async function getNotificationsApi(unreadOnly = false): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>('/notifications', {
    params: unreadOnly ? { unread_only: true } : undefined,
  })
  return data
}

/** GET /notifications/count */
export async function getNotifCountApi(): Promise<NotifCountResponse> {
  const { data } = await api.get<NotifCountResponse>('/notifications/count')
  return data
}

/** PATCH /notifications/:id/read */
export async function markNotifReadApi(notification_id: string): Promise<{ ok: boolean }> {
  const { data } = await api.patch<{ ok: boolean }>(`/notifications/${notification_id}/read`)
  return data
}

/** PATCH /notifications/read-all */
export async function markAllNotifReadApi(): Promise<{ ok: boolean }> {
  const { data } = await api.patch<{ ok: boolean }>('/notifications/read-all')
  return data
}
