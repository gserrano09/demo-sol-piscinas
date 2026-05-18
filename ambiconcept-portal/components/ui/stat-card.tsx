import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface StatCardProps {
  label:  string
  value:  string | number
  icon?:  ReactNode
  delta?: string
  color?: 'green' | 'blue' | 'amber' | 'purple'
  className?: string
}

const colorMap = {
  green:  { bg: 'bg-emerald-50',  text: 'text-emerald-600', icon: 'text-emerald-500' },
  blue:   { bg: 'bg-blue-50',     text: 'text-blue-600',    icon: 'text-blue-500' },
  amber:  { bg: 'bg-amber-50',    text: 'text-amber-600',   icon: 'text-amber-500' },
  purple: { bg: 'bg-purple-50',   text: 'text-purple-600',  icon: 'text-purple-500' },
} as const

export function StatCard({ label, value, icon, delta, color = 'green', className }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={cn('bg-white border border-gray-100 rounded-2xl p-5 shadow-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-800 text-gray-900">{value}</p>
          {delta && <p className={cn('text-xs font-semibold mt-1', c.text)}>{delta}</p>}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.bg)}>
            <span className={cn('w-5 h-5', c.icon)}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  )
}
