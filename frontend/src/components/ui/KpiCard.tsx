import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  accent?: 'primary' | 'cyan' | 'purple' | 'danger'
  loading?: boolean
}

const ACCENT_MAP = {
  primary: {
    text: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
  },
  cyan: {
    text: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10',
    border: 'border-accent-cyan/30',
  },
  purple: {
    text: 'text-accent-purple',
    bg: 'bg-accent-purple/10',
    border: 'border-accent-purple/30',
  },
  danger: {
    text: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
  },
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'primary',
  loading = false,
}: KpiCardProps) {
  const c = ACCENT_MAP[accent]
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="label-caps">{label}</span>
        {Icon && (
          <div
            className={
              'w-8 h-8 rounded-lg border flex items-center justify-center ' +
              c.bg +
              ' ' +
              c.border +
              ' ' +
              c.text
            }
          >
            <Icon size={16} />
          </div>
        )}
      </div>
      <div
        className={
          'font-mono text-2xl md:text-3xl font-bold mt-3 ' + c.text
        }
      >
        {loading ? '\u2014' : value}
      </div>
      {hint && <div className="text-xs text-muted mt-2">{hint}</div>}
    </div>
  )
}
