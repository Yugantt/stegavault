import type { ReactNode } from 'react'

interface CardProps {
  className?: string
  children: ReactNode
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div className={`rounded-2xl bg-surface border border-border p-6 ${className}`}>
      {children}
    </div>
  )
}
