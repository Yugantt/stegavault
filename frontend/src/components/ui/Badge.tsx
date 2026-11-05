import type { ReactNode } from 'react'

const badgeVariants = {
  success: 'bg-green-500/10 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/10 text-red-400 border-red-500/30',
  info: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30',
  default: 'bg-muted/10 text-muted border-muted/30',
} as const

interface BadgeProps {
  variant?: keyof typeof badgeVariants
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-xs font-medium border
        ${badgeVariants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
