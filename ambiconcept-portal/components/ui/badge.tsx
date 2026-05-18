import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

// ── Badge ──────────────────────────────────────────────────
const badgeVariants = {
  green:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  blue:    'bg-blue-50 text-blue-700 border border-blue-200',
  amber:   'bg-amber-50 text-amber-700 border border-amber-200',
  red:     'bg-red-50 text-red-700 border border-red-200',
  gray:    'bg-gray-100 text-gray-600 border border-gray-200',
  brand:   'bg-brand-50 text-brand-700 border border-brand-200',
  purple:  'bg-purple-50 text-purple-700 border border-purple-200',
} as const

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants
}

export function Badge({ variant = 'gray', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full',
        badgeVariants[variant], className,
      )}
      {...props}
    />
  )
}

// ── Card ──────────────────────────────────────────────────
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-white border border-gray-100 rounded-2xl shadow-card', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pt-5 pb-0', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-5', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 pb-5 pt-0 flex items-center gap-3', className)}
      {...props}
    />
  )
}

// ── Select ──────────────────────────────────────────────
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label, error, className, children, ...props
}, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-semibold text-gray-600 tracking-wide uppercase">
        {label}
      </label>
    )}
    <select
      ref={ref}
      className={cn(
        'w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white',
        'transition-all duration-150',
        error && 'border-red-400',
        className,
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
))
Select.displayName = 'Select'
