import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 rounded font-display font-semibold ' +
  'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-blue text-white hover:bg-ink',
  secondary: 'border border-brand-blue text-brand-blue bg-transparent hover:bg-mist',
  ghost: 'text-brand-blue hover:bg-mist',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}
