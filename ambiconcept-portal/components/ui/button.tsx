import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

const variants = {
  primary:  'bg-brand-500 text-white hover:bg-brand-600 shadow-brand/20 shadow-md',
  secondary:'bg-white text-brand-500 border border-brand-200 hover:bg-brand-50',
  ghost:    'text-brand-600 hover:bg-brand-50',
  danger:   'bg-red-500 text-white hover:bg-red-600',
  outline:  'border border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-600',
} as const

const sizes = {
  sm:  'px-3 py-1.5 text-xs rounded-lg',
  md:  'px-4 py-2 text-sm rounded-xl',
  lg:  'px-6 py-3 text-sm rounded-xl',
  xl:  'px-8 py-4 text-base rounded-2xl',
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?:    keyof typeof sizes
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', loading, className, children, disabled, ...props
}, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none',
      variants[variant], sizes[size], className,
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    )}
    {children}
  </button>
))
Button.displayName = 'Button'
