// src/components/common/EmptyState.tsx
import type { ReactNode } from 'react'
import Button from '@/components/ui/Button'

interface EmptyStateProps {
  icon?:       string
  title:       string
  description?: string
  action?:     { label: string; onClick: () => void }
  children?:   ReactNode
}

export default function EmptyState({ icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {icon && <div className="text-5xl mb-4 opacity-30 select-none">{icon}</div>}
      <h3 className="text-base font-semibold text-gray-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-5 max-w-xs">{description}</p>}
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  )
}
