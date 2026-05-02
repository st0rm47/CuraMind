// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// Layout
import AppLayout from '@/components/layout/AppLayout'

// Auth pages
import Login    from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'

// Patient pages
import PatientDashboard from '@/pages/patient/Dashboard'
import HealthInput      from '@/pages/patient/HealthInput'
import Predictions      from '@/pages/patient/Predictions'
import RiskFactors      from '@/pages/patient/Risk'
import Progress from '@/pages/patient/Progress'
import FollowUp from '@/pages/patient/Followup'
import DoctorNotes from '@/pages/patient/Doctornotes'


// Doctor pages
import DoctorDashboard from '@/pages/doctor/Dashboard'
import DoctorQueue     from '@/pages/doctor/Queue'
import DoctorReview    from '@/pages/doctor/Review'

// 404
import NotFound from '@/pages/NotFound'
// import PatientReports from '@/pages/patient/Reports'

/** Redirects unauthenticated users to /login */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null  // handled by FullPageSpinner in App.tsx
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

/** Redirects a specific role away from pages they don't own */
function RoleRoute({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route
          path="/login"
          element={isAuthenticated
            ? <Navigate to={user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />
            : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated
            ? <Navigate to={user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />
            : <Register />}
        />

        {/* ── Authenticated shell ── */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          {/* Root redirect */}
          <Route
            index
            element={
              <Navigate
                to={user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                replace
              />
            }
          />

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
          {/* <Route
            path="/doctor/review/:assessmentId"
            element={<RoleRoute allowedRoles={['doctor']}><DoctorReview /></RoleRoute>}
          /> */}
          {/* <Route
            path="/doctor/corrections"
            element={<RoleRoute allowedRoles={['doctor']}><DoctorCorrections /></RoleRoute>}
          /> */}
        </Route>

        {/*Not found*/}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
