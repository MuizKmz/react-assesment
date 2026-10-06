import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'sm'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-app-primary text-white hover:bg-app-hover active:bg-app-active',
  secondary: 'border border-input-line bg-white text-ink hover:bg-page',
  ghost: 'text-app-primary hover:bg-app-light',
  danger: 'bg-error-text text-white hover:bg-danger-text',
}

const sizes: Record<Size, string> = {
  md: 'h-button px-4 text-body',
  sm: 'h-8 px-3 text-label',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-control font-semibold whitespace-nowrap transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  )
}
