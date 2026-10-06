import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  message: string
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-muted">
      <span className="flex size-10 items-center justify-center rounded-full bg-page text-muted">
        {icon}
      </span>
      <p>{message}</p>
    </div>
  )
}
