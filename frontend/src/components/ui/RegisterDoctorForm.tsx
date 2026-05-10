import { useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getErrorMessage } from '@/services/api'
import { adminApi } from '@/services/admin.service'
import { GENDER_OPTS, type RegisterDoctorForm } from '@/types/admin'

interface Props {
  onSuccess: () => void
}

const EMPTY_FORM: RegisterDoctorForm = {
  name: '', email: '', password: '',
  speciality: '', license_number: '',
  phone: '', dob: '', gender: '',
}

export default function RegisterDoctorForm({ onSuccess }: Props) {
  const [form,     setForm]     = useState<RegisterDoctorForm>(EMPTY_FORM)
  const [errors,   setErrors]   = useState<Partial<Record<keyof RegisterDoctorForm, string>>>({})
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const setField =
    (k: keyof RegisterDoctorForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = (): boolean => {
    const e: Partial<Record<keyof RegisterDoctorForm, string>> = {}
    if (!form.name  || form.name.length < 2)
      e.name = 'At least 2 characters'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email'
    if (!form.password || form.password.length < 8)
      e.password = 'At least 8 characters'
    if (!form.speciality)
      e.speciality = 'Required'
    if (!form.license_number)
      e.license_number = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await adminApi.registerDoctor({
        name:           form.name,
        email:          form.email,
        password:       form.password,
        speciality:     form.speciality     || undefined,
        license_number: form.license_number || undefined,
        phone:          form.phone          || undefined,
        dob:            form.dob            || undefined,
        gender:         form.gender         || undefined,
      })
      toast.success(`Dr. ${form.name} registered successfully!`)
      onSuccess()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="min-w-0 border-brand-500/20">
      <CardHeader
        title="🩺 Register New Doctor"
        subtitle="Create a doctor account on the platform"
      />

      <div className="space-y-4 mt-4">
        {/* Row 1 — name + email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={setField('name')}
            error={errors.name}
            placeholder="Dr. Jane Smith"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            error={errors.email}
            placeholder="doctor@hospital.com"
          />
        </div>

        {/* Row 2 — speciality + license */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Speciality"
            value={form.speciality}
            onChange={setField('speciality')}
            error={errors.speciality}
            placeholder="Cardiologist, Internist…"
          />
          <Input
            label="License Number"
            value={form.license_number}
            onChange={setField('license_number')}
            error={errors.license_number}
            placeholder="NMC-123456"
          />
        </div>

        {/* Row 3 — dob + gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date of Birth"
            type="date"
            value={form.dob}
            onChange={setField('dob')}
            error={errors.dob}
          />
          <Select
            label="Gender"
            options={GENDER_OPTS}
            value={form.gender}
            onChange={setField('gender')}
          />
        </div>

        {/* Row 4 — phone + password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone (optional)"
            type="tel"
            value={form.phone}
            onChange={setField('phone')}
            placeholder="+977 98XXXXXXXX"
          />
          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={setField('password')}
            error={errors.password}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            variant="primary"
            loading={loading}
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            Register Doctor
          </Button>
          <Button
            variant="ghost"
            onClick={onSuccess}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}