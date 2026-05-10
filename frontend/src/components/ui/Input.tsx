import { type InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, rightIcon, ...rest }, ref) => (
    <div className="w-full">
      {label && <label className="form-label">{label}</label>}

      <div className="relative">
        <input
          ref={ref}
          className={clsx(
            'form-input ',   // ALWAYS reserve space
            error && 'form-input-error',
            className
          )}
          {...rest}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error && <p className="form-error">⚠ {error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  ),
)

Input.displayName = 'Input'
export default Input