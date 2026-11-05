import type { ReactNode } from 'react'

interface GlassCardProps {
  className?: string
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function GlassCard({
  className = '',
  children,
  padding = 'md',
}: GlassCardProps) {
  const pad =
    padding === 'none'
      ? ''
      : padding === 'sm'
        ? 'p-4'
        : padding === 'lg'
          ? 'p-8'
          : 'p-6'
  return (
    <div className={'glass rounded-2xl ' + pad + ' ' + className}>
      {children}
    </div>
  )
}
