import clsx from 'clsx'
import type { SearchStatus } from '@/types/place'

/** The only place a search status gets a colour. */
const styles: Record<SearchStatus, { className: string; label: string }> = {
  found: { className: 'bg-found-bg text-found-text', label: 'Found' },
  'no-results': { className: 'bg-none-bg text-none-text', label: 'No results' },
  error: { className: 'bg-error-bg text-error-text', label: 'Error' },
}

export function StatusChip({ status }: { status: SearchStatus }) {
  const { className, label } = styles[status]
  return (
    <span
      className={clsx(
        'inline-flex h-5 items-center rounded-full px-2 text-section font-semibold',
        className,
      )}
    >
      {label}
    </span>
  )
}
