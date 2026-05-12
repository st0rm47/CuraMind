import { useEffect } from 'react'
import Button from '@/components/ui/Button'

interface Props {
  open:        boolean
  title:       string
  message:     string
  confirmLabel?: string
  cancelLabel?:  string
  variant?:    'danger' | 'warning' | 'primary'
  loading?:    boolean
  onConfirm:   () => void
  onCancel:    () => void
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  loading      = false,
  onConfirm,
  onCancel,
}: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  const variantStyles = {
    danger:  { btn: 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20',  icon: '⚠️' },
    warning: { btn: 'bg-amber-500/10 text-amber-400 border-amber-500/25 hover:bg-amber-500/20', icon: '⚠️' },
    primary: { btn: 'bg-brand-500/10 text-brand-400 border-brand-500/25 hover:bg-brand-500/20', icon: 'ℹ️' },
  }
  const { btn, icon } = variantStyles[variant]

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={onCancel}
    >
      {/* Panel — stop propagation so clicking inside doesn't close */}
      <div
        className="w-full max-w-sm rounded-2xl border border-gray-700/60 bg-gray-900 shadow-2xl p-6 space-y-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + title */}
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5 shrink-0">{icon}</span>
          <div className="min-w-0">
            <p className="font-bold text-[15px] text-gray-100">{title}</p>
            <p className="text-[13px] text-gray-400 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-400 border border-gray-700/60 bg-gray-800/50 hover:bg-gray-700/50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-colors disabled:opacity-50 ${btn}`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}