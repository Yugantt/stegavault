// src/pages/Admin.tsx
import { useState } from 'react'
import {
  ShieldAlert,
  Users,
  Activity,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Server,
  TrendingUp,
  Zap,
  X,
} from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'

interface MockUser {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'suspended'
  created_at: string
}

interface MockLog {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error'
  event: string
  source: string
}

const MOCK_USERS: MockUser[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@stegavault.io',
    role: 'admin',
    status: 'active',
    created_at: '2026-10-25',
  },
  {
    id: 2,
    username: 'john.doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    created_at: '2026-10-28',
  },
  {
    id: 3,
    username: 'alice_crypto',
    email: 'alice@lab.security',
    role: 'user',
    status: 'active',
    created_at: '2026-10-29',
  },
  {
    id: 4,
    username: 'bob_operator',
    email: 'bob@enterprise.net',
    role: 'user',
    status: 'active',
    created_at: '2026-10-30',
  },
  {
    id: 5,
    username: 'guest_test',
    email: 'guest@sandbox.dev',
    role: 'user',
    status: 'suspended',
    created_at: '2026-10-31',
  },
]

const MOCK_LOGS: MockLog[] = [
  {
    id: 'LOG-8812',
    timestamp: '2026-11-01 00:15:22',
    level: 'info',
    event: 'AES-GCM key derived via Argon2id (memory=64MB, passes=3)',
    source: '127.0.0.1',
  },
  {
    id: 'LOG-8811',
    timestamp: '2026-11-01 00:12:04',
    level: 'info',
    event: 'Capacity check: image/png 1024x512, capacity=65536 bytes',
    source: '127.0.0.1',
  },
  {
    id: 'LOG-8810',
    timestamp: '2026-11-01 00:08:19',
    level: 'warn',
    event: 'Extract failed: Invalid MAC auth tag (corrupt or wrong password)',
    source: '192.168.1.45',
  },
  {
    id: 'LOG-8809',
    timestamp: '2026-10-31 23:55:10',
    level: 'info',
    event: 'User john.doe authenticated via Bearer token',
    source: '127.0.0.1',
  },
  {
    id: 'LOG-8808',
    timestamp: '2026-10-31 23:40:02',
    level: 'info',
    event: 'Stego carrier generated: veiled_mountain.png (312KB)',
    source: '127.0.0.1',
  },
]

type Tab = 'users' | 'logs'

export default function Admin() {
  const [tab, setTab] = useState<Tab>('users')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = searchQuery.trim()
    ? MOCK_USERS.filter(
        (u) =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : MOCK_USERS

  const filteredLogs = searchQuery.trim()
    ? MOCK_LOGS.filter(
        (l) =>
          l.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : MOCK_LOGS

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            <span className="label-caps text-warning">ADMIN PRIVILEGED</span>
            <span className="text-[10px] font-mono text-muted">
              RBAC · TIER 1
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Admin Console
          </h1>
          <p className="text-sm text-muted-bright mt-1">
            User management, security logs, and system telemetry.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/5 border border-warning/20 text-warning text-[10px] font-mono uppercase tracking-wider">
          <ShieldAlert size={14} />
          Mock data — read-only demo
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="label-caps text-[10px]">Registered</span>
            <Users size={14} className="text-primary" />
          </div>
          <div className="font-mono text-xl font-bold text-white">1,428</div>
          <div className="text-[10px] text-primary mt-0.5 font-mono">
            +12% this month
          </div>
        </div>
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="label-caps text-[10px]">Active</span>
            <Activity size={14} className="text-accent-cyan" />
          </div>
          <div className="font-mono text-xl font-bold text-accent-cyan">342</div>
          <div className="text-[10px] text-muted mt-0.5 font-mono">
            Live tokens
          </div>
        </div>
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="label-caps text-[10px]">Operations</span>
            <TrendingUp size={14} className="text-accent-purple" />
          </div>
          <div className="font-mono text-xl font-bold text-accent-purple">
            8,421
          </div>
          <div className="text-[10px] text-muted mt-0.5 font-mono">
            Lifetime
          </div>
        </div>
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="label-caps text-[10px]">Alerts</span>
            <ShieldAlert size={14} className="text-danger" />
          </div>
          <div className="font-mono text-xl font-bold text-danger">0</div>
          <div className="text-[10px] text-muted mt-0.5 font-mono">
            Zero breaches
          </div>
        </div>
      </div>

      {/* TABS */}
      <GlassCard padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-deep border border-border">
            <button
              onClick={() => {
                setTab('users')
                setSearchQuery('')
              }}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'users'
                  ? 'bg-primary text-bg-deep font-bold'
                  : 'text-muted-bright hover:text-text'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Users size={12} />
                Users ({MOCK_USERS.length})
              </span>
            </button>
            <button
              onClick={() => {
                setTab('logs')
                setSearchQuery('')
              }}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'logs'
                  ? 'bg-accent-cyan text-bg-deep font-bold'
                  : 'text-muted-bright hover:text-text'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Terminal size={12} />
                Logs ({MOCK_LOGS.length})
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-lg bg-bg-deep border border-border text-sm text-white placeholder-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-white rounded cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* USERS TABLE */}
        {tab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 label-caps text-[10px]">
                    User
                  </th>
                  <th className="text-left px-4 py-3 label-caps text-[10px]">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 label-caps text-[10px]">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 label-caps text-[10px]">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 label-caps text-[10px]">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border/50 hover:bg-surface-hover/50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs font-mono font-bold">
                          {u.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {u.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-bright">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                          u.role === 'admin'
                            ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/30'
                            : 'bg-surface text-muted border-border'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs ${
                          u.status === 'active' ? 'text-primary' : 'text-danger'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'active' ? 'bg-primary' : 'bg-danger'
                          }`}
                        />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted">
                      {u.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LOGS TABLE */}
        {tab === 'logs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 label-caps text-[10px]">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 label-caps text-[10px]">
                    Timestamp
                  </th>
                  <th className="text-left px-4 py-3 label-caps text-[10px]">
                    Level
                  </th>
                  <th className="text-left px-4 py-3 label-caps text-[10px]">
                    Event
                  </th>
                  <th className="text-right px-4 py-3 label-caps text-[10px]">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border/50 hover:bg-surface-hover/50 last:border-0 font-mono"
                  >
                    <td className="px-4 py-3 text-xs text-accent-cyan">
                      {log.id}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase border ${
                          log.level === 'warn'
                            ? 'bg-warning/10 text-warning border-warning/30'
                            : log.level === 'error'
                            ? 'bg-danger/10 text-danger border-danger/30'
                            : 'bg-primary/10 text-primary border-primary/30'
                        }`}
                      >
                        {log.level === 'warn' ? (
                          <AlertTriangle size={10} />
                        ) : (
                          <CheckCircle2 size={10} />
                        )}
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white">
                      {log.event}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted">
                      {log.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* SYSTEM MONITORING */}
      <GlassCard padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Server size={20} />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">
              System Monitoring
            </h2>
            <p className="text-xs text-muted-bright mt-0.5">
              Live health check
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-bg-deep border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                API Backend
              </span>
              <Zap size={12} className="text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold text-primary font-mono">
                OPERATIONAL
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-bg-deep border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                Processing Queue
              </span>
              <Activity size={12} className="text-accent-cyan" />
            </div>
            <div className="text-sm font-bold text-white font-mono">
              0 pending · 8.4k done
            </div>
          </div>
          <div className="p-4 rounded-xl bg-bg-deep border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                Error Rate
              </span>
              <AlertTriangle size={12} className="text-primary" />
            </div>
            <div className="text-sm font-bold text-primary font-mono">
              0.02% (2/8421)
            </div>
          </div>
        </div>
      </GlassCard>

      {/* FOOTER NOTICE */}
      <div className="p-3 rounded-lg bg-surface border border-border flex items-center gap-2 text-[10px] font-mono text-muted uppercase tracking-wider">
        <Filter size={12} />
        All data shown is mock / demo data. Real admin APIs are pending backend
        implementation.
      </div>
    </div>
  )
}
