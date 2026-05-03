// src/components/ui/Select.tsx
import { type SelectHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string
  error?:   string
  options:  { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...rest }, ref) => (
    <div className="w-full">
      {label && <label className="form-label">{label}</label>}
      <select
        ref={ref}
        className={clsx(
          'form-input appearance-none cursor-pointer',
          error && 'form-input-error',
          className,
        )}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="form-error">⚠ {error}</p>}
    </div>
  ),
)
Select.displayName = 'Select'
export default Select
