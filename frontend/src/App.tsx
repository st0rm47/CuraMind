// src/App.tsx
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import AppRoutes from '@/routes/AppRoutes'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

// Inner component so useAuth can be called after AuthProvider mounts
function AppInner() {
  const { isLoading } = useAuth()
  if (isLoading) return <FullPageSpinner />
  return <AppRoutes />
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0d1117',
            color:      '#e2eeff',
            border:     '1px solid #374151',
            fontFamily: 'Outfit, sans-serif',
            fontSize:   '13px',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#00d4a8', secondary: '#0d1117' },
          },
          error: {
            iconTheme: { primary: '#ff5f7e', secondary: '#0d1117' },
          },
        }}
      />
    </AuthProvider>
  )
}
