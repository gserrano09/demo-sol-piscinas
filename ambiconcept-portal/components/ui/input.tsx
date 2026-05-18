import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:  string
  error?:  string
  hint?:   string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, className, ...props
}, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-semibold text-gray-600 tracking-wide uppercase">
        {label}
      </label>
    )}
    <input
      ref={ref}
      className={cn(
        'w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white',
        'transition-all duration-150',
        error && 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400',
        className,
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
    {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
))
Input.displayName = 'Input'
