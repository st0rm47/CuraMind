import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export default function ProtectedRoute() {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  // Role-based protection (IMPORTANT)
  const path = location.pathname

  if (user?.role === "doctor" && path.startsWith("/patient")) {
    return <Navigate to="/doctor/dashboard" replace />
  }

  if (user?.role === "patient" && path.startsWith("/doctor")) {
    return <Navigate to="/patient/dashboard" replace />
  }

  // ✅ Block non-admins from /admin routes
  if (user?.role !== "admin" && path.startsWith("/admin")) {
    return <Navigate to={user?.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"} replace />
  }

  // ✅ Block admins from /patient and /doctor routes
  if (user?.role === "admin" && (path.startsWith("/patient") || path.startsWith("/doctor"))) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet />
}