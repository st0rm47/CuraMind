// src/services/doctor.service.ts
// All doctor-facing API calls.

import api from './api'
import type { DoctorReviewPayload } from '@/types/report'
import type {
  DoctorQueueResponse,
  AnalyticsSummary,
  CorrectionsResponse,
} from '@/types/doctor'

import type { DoctorDashboardResponse } from '@/types/doctor'
 
/**
 * GET /doctor/dashboard
 * Single call returning all data the doctor dashboard needs.
 */
export async function getDoctorDashboardApi(): Promise<DoctorDashboardResponse> {
  const { data } = await api.get<DoctorDashboardResponse>('/doctor/dashboard')
  return data
}

/**
 * GET /doctor/queue?status_filter=&page=&limit=
 */
export async function getDoctorQueueApi(
  statusFilter: 'all' | 'pending' | 'reviewed' = 'all',
  page = 1,
  limit = 30,
): Promise<DoctorQueueResponse> {
  const { data } = await api.get<DoctorQueueResponse>('/doctor/queue', {
    params: { status_filter: statusFilter, page, limit },
  })
  return data
}

/**
 * POST /doctor/review
 * Submit a clinical review for an assessment.
 */
export async function submitReviewApi(
  payload: DoctorReviewPayload,
): Promise<{ ok: boolean; review_id: string }> {
  const { data } = await api.post<{ ok: boolean; review_id: string }>(
    '/doctor/review',
    payload,
  )
  return data
}

/**
 * GET /doctor/corrections?page=&limit=
 */
export async function getCorrectionsApi(
  page = 1,
  limit = 30,
): Promise<CorrectionsResponse> {
  const { data } = await api.get<CorrectionsResponse>('/doctor/corrections', {
    params: { page, limit },
  })
  return data
}

/**
 * GET /doctor/analytics
 */
export async function getAnalyticsApi(): Promise<AnalyticsSummary> {
  const { data } = await api.get<AnalyticsSummary>('/doctor/analytics')
  return data
}

