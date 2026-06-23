import type { HTMLAttributes } from 'react'
import { cn } from '../cn'

/** Small label chip. Neutral by default; pass className to recolour. */
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm bg-mist px-2 py-0.5 text-xs font-medium text-ink',
        className,
      )}
      {...props}
    />
  )
}
