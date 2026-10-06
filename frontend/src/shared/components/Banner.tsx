import type { ReactNode } from 'react'
import clsx from 'clsx'
import { AlertTriangle, Info, XCircle } from 'lucide-react'

export type BannerKind = 'info' | 'warning' | 'error'

const styles: Record<BannerKind, { box: string; Icon: typeof Info }> = {
  info: { box: 'border-app-light-border bg-app-light text-app-ink', Icon: Info },
  warning: { box: 'border-warning-border bg-warning-bg text-warning-text', Icon: AlertTriangle },
  error: { box: 'border-danger-border bg-danger-bg text-danger-text', Icon: XCircle },
}

interface BannerProps {
  kind: BannerKind
  children: ReactNode
  action?: ReactNode
  className?: string
}

export function Banner({ kind, children, action, className }: BannerProps) {
  const { box, Icon } = styles[kind]
  return (
    <div
      role={kind === 'info' ? 'status' : 'alert'}
      className={clsx('flex items-start gap-2 rounded-control border px-3 py-2.5', box, className)}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
