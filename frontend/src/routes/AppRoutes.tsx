// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// Layout
import AppLayout from '@/components/layout/AppLayout'

// Auth pages
import LandingPage from '@/pages/LandingPage'
import Login       from '@/pages/auth/Login'
import Register    from '@/pages/auth/Register'

// Patient pages
import PatientDashboard from '@/pages/patient/Dashboard'
import HealthInput      from '@/pages/patient/HealthInput'
import Predictions      from '@/pages/patient/Predictions'
import RiskFactors      from '@/pages/patient/Risk'
import Progress         from '@/pages/patient/Progress'
import FollowUp         from '@/pages/patient/Followup'
import DoctorNotes      from '@/pages/patient/Doctornotes'

// Doctor pages
import DoctorDashboard from '@/pages/doctor/Dashboard'
import DoctorQueue     from '@/pages/doctor/Queue'
import DoctorReview    from '@/pages/doctor/Review'
import DoctorFollowUps from '@/pages/doctor/DoctorFollowup'
import Corrections       from '@/pages/doctor/Corrections'

// 404
import NotFound from '@/pages/NotFound'
import AdminDashboard from '@/pages/admin/AdminDashboard'

// ─── Guards ───────────────────────────────────────────────────────────────────

/**
 * Redirects unauthenticated users to /login.
 * While auth is still loading, renders nothing (FullPageSpinner handled in App.tsx).
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

/**
 * Redirects a user whose role is not in allowedRoles back to their own dashboard.
 * Does NOT log them out — they are still authenticated.
 */
function RoleRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: string[]
  children: React.ReactNode
}) {
  const { user } = useAuth()
  if (!user || !allowedRoles.includes(user.role)) {
    // Send them to the correct dashboard rather than /login
    const fallback =
      user?.role === 'doctor' ? '/doctor/dashboard'
      : user?.role === 'admin' ? '/admin/dashboard'
      : '/patient/dashboard'
    return <Navigate to={fallback} replace />
  }
  return <>{children}</>
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  const dashboardPath =
    user?.role === 'doctor' ? '/doctor/dashboard'
    : user?.role === 'admin' ? '/admin/dashboard'
    : '/patient/dashboard'
    
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Landing page — always public, never logs the user out ── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Auth pages — redirect to dashboard if already logged in ── */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={dashboardPath} replace />
              : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to={dashboardPath} replace />
              : <Register />
          }
        />

        {/* ── Authenticated shell ── */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          {/* ── Patient routes ── */}
          <Route
            path="/patient/dashboard"
            element={<RoleRoute allowedRoles={['patient']}><PatientDashboard /></RoleRoute>}
          />
          <Route
            path="/patient/healthinput"
            element={<RoleRoute allowedRoles={['patient']}><HealthInput /></RoleRoute>}
          />
          <Route
            path="/patient/predictions"
            element={<RoleRoute allowedRoles={['patient']}><Predictions /></RoleRoute>}
          />
          <Route
            path="/patient/risk"
            element={<RoleRoute allowedRoles={['patient']}><RiskFactors /></RoleRoute>}
          />
          <Route
            path="/patient/progress"
            element={<RoleRoute allowedRoles={['patient']}><Progress /></RoleRoute>}
          />
          <Route
            path="/patient/followup"
            element={<RoleRoute allowedRoles={['patient']}><FollowUp /></RoleRoute>}
          />
          <Route
            path="/patient/notes"
            element={<RoleRoute allowedRoles={['patient']}><DoctorNotes /></RoleRoute>}
          />

          {/* ── Doctor routes ── */}
          <Route
            path="/doctor/dashboard"
            element={<RoleRoute allowedRoles={['doctor']}><DoctorDashboard /></RoleRoute>}
          />
          <Route
            path="/doctor/queue"
            element={<RoleRoute allowedRoles={['doctor']}><DoctorQueue /></RoleRoute>}
          />
          <Route
            path="/doctor/review"
            element={<RoleRoute allowedRoles={['doctor']}><DoctorReview /></RoleRoute>}
          />
          <Route
            path="/doctor/followups"
            element={<RoleRoute allowedRoles={['doctor']}><DoctorFollowUps /></RoleRoute>}
          />
          <Route
            path="/doctor/corrections"
            element={<RoleRoute allowedRoles={['doctor']}><Corrections /></RoleRoute>}
           />

          {/* ── Admin routes (if implemented) ── */}
          <Route  
            path="/admin/dashboard"
            element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>}
              />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}