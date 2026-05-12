// src/pages/auth/Register.tsx
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import Input  from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import type { UserRole, Gender } from '@/types/user'
import { APP_NAME, APP_TAGLINE } from '@/utils/constants'
import { Eye, EyeOff } from 'lucide-react'

interface FormState {
  name:            string
  email:           string
  password:        string
  confirmPassword: string
  dob:             string
  gender:          Gender
  phone:           string
  speciality:      string
  license_number:  string
}
interface FormErrors { [k: string]: string | undefined }

const GENDER_OPTS = [
  { value: 'male',   label: 'Male'   },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other'  },
]

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const role: UserRole = 'patient'  // doctors are registered by admin only
  const [form, setForm]     = useState<FormState>({
    name: '', email: '', password: '', confirmPassword: '',
    dob: '', gender: 'male', phone: '', speciality: '', license_number: '',
  })
  const [errors,              setErrors]              = useState<FormErrors>({})
  const [loading,             setLoading]             = useState(false)
  const [showPassword,        setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.name  || form.name.length  < 2)   e.name  = 'Name must be at least 2 characters'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'

    if (!form.password || form.password.length < 8) {
      e.password = 'At least 8 characters'
    } else if (!/[A-Z]/.test(form.password)) {
      e.password = 'Must include uppercase letter'
    } else if (!/[a-z]/.test(form.password)) {
      e.password = 'Must include lowercase letter'
    } else if (!/\d/.test(form.password)) {
      e.password = 'Must include a number'
    }
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.dob) e.dob = 'Date of birth is required'
    // doctor fields handled by admin registration only
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register({
        name:           form.name,
        email:          form.email,
        password:       form.password,
        role,
        dob:            form.dob,
        gender:         form.gender,
        phone:          form.phone || undefined,
        speciality:     role === 'doctor' ? form.speciality      || undefined : undefined,
        license_number: role === 'doctor' ? form.license_number  || undefined : undefined,
      })
      navigate(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    // FIX 1: py-8 on mobile so the card doesn't kiss the top/bottom of short screens;
    // items-start on mobile lets the card scroll naturally rather than being clipped.
    <div className="min-h-screen flex items-start sm:items-center justify-center bg-gray-950 relative overflow-x-hidden py-8 px-4 sm:p-5">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-brand-500/4 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Card — FIX 2: full-width on mobile, tighter padding, rounded-2xl on mobile */}
      <div className="relative w-full max-w-[480px] bg-gray-900 border border-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,.5)] animate-slide-up">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'linear-gradient(135deg,#4da3ff,#00d4a8)' }}
          >
            🧬
          </div>
          <div>
            <p className="font-extrabold text-[18px] sm:text-[20px] leading-tight">{APP_NAME}</p>
            <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">{APP_TAGLINE}</p>
          </div>
        </div>

        <h1 className="text-[22px] sm:text-[24px] font-extrabold tracking-tight mb-1">Create account</h1>
        <p className="text-sm text-gray-400 mb-5 sm:mb-6">Join for AI-powered health insights</p>

        {/* Patient-only registration — doctors are registered by admin */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-500/8 border border-teal-500/20 mb-5 sm:mb-6">
          <span className="text-base">🧑</span>
          <p className="text-[12px] text-teal-400 font-medium">Patient registration</p>
          <span className="ml-auto text-[10px] text-gray-500">Doctors are registered by admin</span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
          />

          {/* FIX 3: DOB + Gender grid — single col on mobile (date inputs are too
              narrow at ~155px on a 390px phone), side-by-side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Date of Birth"
              type="date"
              value={form.dob}
              onChange={set('dob')}
              error={errors.dob}
            />
            <Select
              label="Gender"
              options={GENDER_OPTS}
              value={form.gender}
              onChange={set('gender')}
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Phone Number"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
          />

          {/* Doctor fields removed — handled by admin */}

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <Button
            type="submit"
            variant="primary"
            full
            loading={loading}
            className="mt-2"
          >
            {loading ? 'Creating account…' : 'Create Account →'}
          </Button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}