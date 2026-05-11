// src/pages/NotFound.tsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const homePath = user?.role === 'doctor'
    ? '/doctor/dashboard'
    : user
    ? '/patient/dashboard'
    : '/login'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 sm:p-6">
      {/* FIX 1: max-w-sm on mobile so content doesn't stretch edge-to-edge on wide phones */}
      <div className="text-center w-full max-w-sm sm:max-w-md animate-slide-up">

        {/* Decorative ring — FIX 2: smaller on mobile so it doesn't dominate the screen */}
        <div className="relative w-28 h-28 sm:w-40 sm:h-40 mx-auto mb-6 sm:mb-8">
          <div className="absolute inset-0 rounded-full bg-brand-500/8 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-brand-500/10" />
          <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-7xl select-none">
            🧬
          </div>
        </div>

        {/* FIX 3: scale down the 404 numeral on mobile — text-6xl instead of text-7xl */}
        <h1 className="text-6xl sm:text-7xl font-extrabold text-brand-500/40 mb-2 font-mono">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold mb-3">Page Not Found</h2>

        <p className="text-gray-400 text-sm mb-8 leading-relaxed px-2">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* FIX 4: full-width stacked buttons on mobile, inline on sm+ */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
          <Button variant="primary" onClick={() => navigate(homePath)} className="w-full sm:w-auto">
            ← Go Home
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}