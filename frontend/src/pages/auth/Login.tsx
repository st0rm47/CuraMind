// src/pages/auth/Login.tsx
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import Input    from '@/components/ui/Input'
import Button   from '@/components/ui/Button'
import { APP_NAME, APP_TAGLINE } from '@/utils/constants'
import { Eye, EyeOff } from 'lucide-react'

interface FormErrors { email?: string; password?: string }

export default function Login() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState<FormErrors>({})
  const [loading,  setLoading]  = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Validate form inputs
  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address'
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Handle form submission
  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const  res  = await login({ email, password })

      const userRole = res.user.role
      navigate(userRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden p-5">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-teal-500/4 blur-3xl" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative w-full max-w-[420px] bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-[0_8px_40px_rgba(0,0,0,.5)] animate-slide-up">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'linear-gradient(135deg,#4da3ff,#00d4a8)' }}
          >
            🧬
          </div>
          <div>
            <p className="font-extrabold text-[20px] leading-tight">{APP_NAME}</p>
            <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">{APP_TAGLINE}</p>
          </div>
        </div>

        <h1 className="text-[26px] font-extrabold tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-6">Log in to your health dashboard</p>


        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <Button type="submit" variant="primary" full loading={loading} className="mt-2">
            {loading ? 'Logging in…' : 'Log In →'}
          </Button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-400">
          No account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
