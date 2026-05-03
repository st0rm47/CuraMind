// src/components/ui/Button.tsx
import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'teal' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?:    Size
  full?:    boolean
  loading?: boolean
  children: ReactNode
}

const variantCls: Record<Variant, string> = {
  primary: 'btn btn-primary',
  teal:    'btn btn-teal',
  ghost:   'btn btn-ghost',
  danger:  'btn btn-danger',
}
const sizeCls: Record<Size, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

export default function Button({
  variant = 'primary',
  size    = 'md',
  full    = false,
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(variantCls[variant], sizeCls[size], full && 'btn-full', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
