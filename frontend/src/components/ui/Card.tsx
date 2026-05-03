// src/components/ui/Card.tsx
import { type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children:  ReactNode
  hover?:    boolean
  glow?:     boolean
  accent?:   boolean
}

export default function Card({ children, hover, glow, accent, className, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'card',
        hover  && 'card-hover cursor-pointer',
        glow   && 'shadow-glow',
        accent && 'border-brand-500/40 bg-brand-500/5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title:     string
  subtitle?: string
  action?:   ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-bold text-[15px] tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
