import api from '@/services/api'
import type { AdminStats, Doctor, Patient } from '@/types/admin'

export const adminApi = {
  getStats: () =>
    api.get<AdminStats>('/admin/stats').then((r) => r.data),

  getDoctors: (page: number, search: string, limit = 20) =>
    api
      .get<{ doctors: Doctor[]; total: number; page: number; pages: number }>(
        '/admin/doctors',
        { params: { page, limit, search } },
      )
      .then((r) => r.data),

  getPatients: (page: number, search: string, limit = 20) =>
    api
      .get<{ patients: Patient[]; total: number; page: number; pages: number }>(
        '/admin/patients',
        { params: { page, limit, search } },
      )
      .then((r) => r.data),

  registerDoctor: (body: {
    name: string
    email: string
    password: string
    speciality?: string
    license_number?: string
    phone?: string
    dob?: string
    gender?: string
  }) => api.post('/admin/doctors', body).then((r) => r.data),

  deactivateDoctor: (id: string) =>
    api.delete(`/admin/doctors/${id}`).then((r) => r.data),

  activateDoctor: (id: string) =>
    api.post(`/admin/doctors/${id}/activate`).then((r) => r.data),
}