import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  message: string
}

/** Friendly placeholder: an icon in soft concentric rings, then one line of text. */
export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="pf-enter-up flex flex-col items-center gap-3 px-6 py-12 text-center text-muted">
      <span className="relative flex size-20 items-center justify-center">
        <span aria-hidden className="absolute inset-0 rounded-full bg-app-light" />
        <span aria-hidden className="absolute inset-3 rounded-full bg-app-light-border/50" />
        <span className="relative flex size-10 items-center justify-center rounded-full bg-white text-app-ink shadow-sm">
          {icon}
        </span>
      </span>
      <p className="max-w-56">{message}</p>
    </div>
  )
}
