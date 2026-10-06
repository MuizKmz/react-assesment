import clsx from 'clsx'

interface SpinnerProps {
  /** Screen-reader text; pass null when a nearby element already announces loading. */
  label?: string | null
  className?: string
}

export function Spinner({ label = 'Loading', className }: SpinnerProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
      className={clsx(
        'inline-block size-4 animate-spin rounded-full border-2 border-app-light-border border-t-app-primary',
        className,
      )}
    >
      {label && <span className="sr-only">{label}</span>}
    </span>
  )
}
