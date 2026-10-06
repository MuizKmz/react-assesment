import clsx from 'clsx'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { IconButton } from '@/shared/components/IconButton'
import { selectToasts } from '../selectors'
import { toastDismissed, type ToastKind } from '../slice'

const icons: Record<ToastKind, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  error: XCircle,
}

const tones: Record<ToastKind, string> = {
  info: 'text-app-ink',
  success: 'text-found-text',
  error: 'text-error-text',
}

/** Short messages in the corner. The ui saga removes each one after a few seconds. */
export function Toaster() {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector(selectToasts)

  // Centred over the visible map on desktop, clear of the panel and the zoom controls.
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 lg:right-24 lg:bottom-8 lg:left-[calc(var(--spacing-sidebar)+2rem)]"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.kind]
        return (
          <div
            key={toast.id}
            role={toast.kind === 'error' ? 'alert' : 'status'}
            className="pf-enter-up pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl border border-line bg-white py-2 pr-2 pl-3 shadow-xl shadow-ink/15"
          >
            <Icon aria-hidden className={clsx('size-4 shrink-0', tones[toast.kind])} />
            <p className="flex-1">{toast.message}</p>
            <IconButton
              label="Dismiss"
              size="sm"
              icon={<X className="size-4" />}
              onClick={() => dispatch(toastDismissed(toast.id))}
            />
          </div>
        )
      })}
    </div>
  )
}
