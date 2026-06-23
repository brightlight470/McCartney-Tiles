import type { HTMLAttributes } from 'react'
import { cn } from '../cn'

/** Page-width container. Centred, max 80rem, responsive gutters. */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[80rem] px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  )
}
