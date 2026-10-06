import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Required: icon-only buttons need an accessible name. Also used as the tooltip. */
  label: string
  icon: ReactNode
  size?: 'sm' | 'md'
}

export function IconButton({
  label,
  icon,
  size = 'md',
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-control text-muted transition-colors',
        'hover:bg-page hover:text-ink disabled:cursor-not-allowed disabled:opacity-50',
        size === 'md' ? 'size-8' : 'size-7',
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  )
}
