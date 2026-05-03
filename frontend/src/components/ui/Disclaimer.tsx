// src/components/ui/Disclaimer.tsx
import type { ReactNode } from 'react'
import clsx from 'clsx'

interface DisclaimerProps {
  title:     string
  children:  ReactNode
  className?: string
}

export default function Disclaimer({ title, children, className }: DisclaimerProps) {
  return (
    <div className={clsx('disclaimer', className)}>
      <span className="text-xl shrink-0">⚠️</span>
      <div>
        <p className="disclaimer-title">{title}</p>
        <div className="disclaimer-body">{children}</div>
      </div>
    </div>
  )
}
