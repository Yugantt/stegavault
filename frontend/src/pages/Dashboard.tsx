import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, Image as ImageIcon, Music, Video, Globe,
  Lock, AlertTriangle, Zap, Clock, Calculator,
  ScanLine, ArrowRight, ChevronRight,
  MessageSquare, LifeBuoy, FileText, Send,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api, getApiErrorMessage } from '../lib/api'
import type { HistoryStats, HistoryList, HistoryEntry } from '../types'
import CapacityModal from '../components/CapacityModal'

// ---------- Constants ----------

const RECENT_LIMIT = 5
const HISTORY_FETCH_LIMIT = 100

type ModuleKey = 'image' | 'audio' | 'video'
type ModuleStat = { hide: number; extract: number }

const STUDIOS = [
  { title: 'Image Studio', desc: 'Hide in PNG/JPG', icon: ImageIcon, to: '/stego/image', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { title: 'Audio Studio', desc: 'Hide in WAV/MP3', icon: Music, to: '/stego/audio', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { title: 'Video Studio', desc: 'Hide in MP4/AVI', icon: Video, to: '/stego/video', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { title: 'Cross Media', desc: 'Hide Any → Any', icon: Globe, to: '/stego/scan', color: 'text-amber-400', bg: 'bg-amber-500/10' },
] as const

const SCANNERS = [
  { title: 'Image Scanner', icon: ImageIcon, to: '/stego/extract' },
  { title: 'Audio Scanner', icon: Music, to: '/stego/extract' },
  { title: 'Video Scanner', icon: Video, to: '/stego/video' },
] as const

const FLOW_STEPS = ['ENCRYPT', 'EMBED', 'TRANSMIT'] as const

// ---------- Derived-state hook ----------

function useModuleStats(items: HistoryEntry[]): Record<ModuleKey, ModuleStat> {
  return useMemo(() => {
    const acc: Record<ModuleKey, ModuleStat> = {
      image: { hide: 0, extract: 0 },
      audio: { hide: 0, extract: 0 },
      video: { hide: 0, extract: 0 },
    }
    for (const item of items) {
      if (item.status !== 'success') continue
      const bucket = acc[item.module as ModuleKey]
      if (!bucket) continue
      if (item.action === 'hide') bucket.hide++
      else if (item.action === 'extract') bucket.extract++
    }
    return acc
  }, [items])
}

// ---------- Presentational helpers ----------

function FlowBadge({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.div
      animate={{ borderColor: ['rgba(16,185,129,0.3)', 'rgba(16,185,129,0.8)', 'rgba(16,185,129,0.3)'] }}
      transition={{ duration: 2, repeat: Infinity, delay }}
      className="px-3 py-1 rounded bg-[#10B981]/10 border text-[10px] font-mono text-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.1)] relative z-10"
    >
      {label}
    </motion.div>
  )
}

// ---------- Main component ----------

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)

  const [stats, setStats] = useState<HistoryStats | null>(null)
  const [items, setItems] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCalcOpen, setIsCalcOpen] = useState(false)

  const recent = useMemo(() => items.slice(0, RECENT_LIMIT), [items])
  const moduleStats = useModuleStats(items)

  useEffect(() => {
    let mounted = true

    const fetchDashboard = async () => {
      const results = await Promise.allSettled([
        api.get<HistoryStats>('/history/stats'),
        api.get<HistoryList>(`/history?limit=${HISTORY_FETCH_LIMIT}&offset=0`),
      ])

      if (!mounted) return

      const [statsResult, historyResult] = results
      if (statsResult.status === 'fulfilled') setStats(statsResult.value.data)
      if (historyResult.status === 'fulfilled') setItems(historyResult.value.data?.items ?? [])

      const bothFailed = results.every((r) => r.status === 'rejected')
      if (bothFailed) {
        setError(
          getApiErrorMessage(
            results[0].status === 'rejected' ? results[0].reason : null,
            'Failed to sync telemetry',
          ),
        )
      }
      setLoading(false)
    }

    fetchDashboard()
    return () => { mounted = false }
  }, [])

  const successRate = useMemo(() => {
    const total = stats?.total_operations ?? 0
    if (!total) return '100%'
    const failures = Math.min(stats?.failures ?? 0, total)
    return `${Math.round(((total - failures) / total) * 100)}%`
  }, [stats])

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20 selection:bg-emerald-500 selection:text-black">
      <CapacityModal isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ================= 1. WELCOME HERO ================= */}
      <section className="relative rounded-3xl bg-[#131920] border border-slate-800 overflow-hidden min-h-[220px] flex items-center justify-between p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Hello, <span className="text-[#10B981]">{user?.username || 'Operator'}</span>!
          </h1>
          <p className="text-slate-400 mt-3 text-lg">Ready to hide something today?</p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/stego/image"
              className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2"
            >
              <Lock size={16} /> Hide New Secret
            </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-64 h-64 md:w-80 md:h-80 pointer-events-none">
          <motion.img
            src="/spiderman.png"
            alt="Spider-Man"
            className="w-full h-full object-contain object-bottom drop-shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      </section>

      {/* ================= 2. MEDIA STUDIOS ================= */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="text-[#10B981]" size={20} /> Media Studios
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STUDIOS.map((studio) => (
            <Link
              key={studio.title}
              to={studio.to}
              className="group p-6 rounded-2xl bg-[#131920] border border-slate-800 hover:border-[#10B981]/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${studio.bg} ${studio.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <studio.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">{studio.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{studio.desc}</p>
              <div className="mt-4 flex items-center text-xs font-bold text-[#10B981]">
                Open Studio <ChevronRight size={14} className="ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 3. SECRET TRANSMISSION ================= */}
      <section className="rounded-3xl bg-[#131920] border border-slate-800 p-8 relative overflow-hidden group/section">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-32 bg-emerald-500/5 blur-[100px] pointer-events-none" />

        <div className="text-center mb-10 relative z-10">
          <h2 className="text-2xl font-bold text-white">One file. Another secret.</h2>
          <p className="text-slate-400 text-sm mt-1">Your secret travels inside an ordinary file.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 relative z-10">
          <div className="w-full md:w-64 p-6 rounded-2xl bg-[#0B0F14] border border-slate-800 text-center relative overflow-hidden group hover:border-[#10B981]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-[#10B981] transition-colors">
              <ImageIcon size={28} strokeWidth={1.5} />
            </div>
            <h4 className="text-sm font-bold text-white relative z-10">Carrier File</h4>
            <p className="text-[10px] text-slate-500 mt-1 font-mono relative z-10">e.g., photograph.png</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-slate-800 -z-10 overflow-hidden">
              <motion.div
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#10B981] to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            {FLOW_STEPS.map((label, i) => (
              <div key={label} className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                {i > 0 && <ArrowRight size={14} className="hidden md:block text-[#10B981]/50" />}
                <FlowBadge label={label} delay={i * 0.3} />
              </div>
            ))}
          </div>

          <div className="w-full md:w-64 p-6 rounded-2xl bg-[#0B0F14] border border-slate-800 text-center relative overflow-hidden group hover:border-[#10B981]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-[#10B981] transition-colors">
              <Lock size={28} strokeWidth={1.5} />
            </div>
            <h4 className="text-sm font-bold text-white relative z-10">Secret Payload</h4>
            <p className="text-[10px] text-slate-500 mt-1 font-mono relative z-10">e.g., hidden_text.txt</p>
          </div>
        </div>

        <div className="text-center mt-10 relative z-10">
          <motion.span
            animate={{ boxShadow: ['0px 0px 0px rgba(16,185,129,0)', '0px 0px 15px rgba(16,185,129,0.3)', '0px 0px 0px rgba(16,185,129,0)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-bold border border-[#10B981]/30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Ready for Transmission
          </motion.span>
        </div>
      </section>

      {/* ================= 4. HIDDEN MESSAGE DETECTOR ================= */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Is something hidden inside?</h2>
          <p className="text-sm text-slate-400">Explore files and inspect them for possible hidden data.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCANNERS.map((scan) => (
            <Link
              key={scan.title}
              to={scan.to}
              className="group relative p-6 rounded-2xl bg-[#131920] border border-slate-800 overflow-hidden hover:border-[#10B981]/50 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10B981]/10 to-transparent h-[200%] -top-full animate-[scan_3s_ease-in-out_infinite] pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white">
                  <scan.icon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{scan.title}</h3>
                  <p className="text-xs text-[#10B981] mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Open Scanner <ArrowRight size={12} />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 5. RECENT HISTORY + STATS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-[#131920] border border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-[#10B981]" /> Recent History
            </h3>
            <Link to="/history" className="text-xs font-bold text-[#10B981] hover:underline">View All</Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-xs text-slate-500 animate-pulse">Fetching logs...</div>
            ) : recent.length === 0 ? (
              <div className="text-xs text-slate-500 py-4">No recent operations found.</div>
            ) : (
              recent.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F14] border border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${item.action === 'hide' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                      {item.action === 'hide' ? <Lock size={14} /> : <Search size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.filename}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-[#131920] border border-slate-800 p-6">
          <h3 className="text-base font-bold text-white mb-4">Operation Statistics</h3>
          <div className="space-y-4">
            {(['image', 'audio', 'video'] as const).map((key) => {
              const stat = moduleStats[key]
              const Icon = key === 'image' ? ImageIcon : key === 'audio' ? Music : Video
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400 capitalize">
                    <Icon size={14} /> {key}
                  </div>
                  <div className="text-xs font-mono text-white">
                    {stat.hide} H / {stat.extract} E
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ================= 6. PAYLOAD CALC + QUICK COMMAND ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#131920] border border-slate-800 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#10B981]/10 text-[#10B981]">
            <Calculator size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white">Payload Capacity Calculator</h3>
            <p className="text-xs text-slate-400 mt-1 mb-3">Estimate how much secret data your file can hold.</p>
            <button
              type="button"
              onClick={() => setIsCalcOpen(true)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              Open Calculator
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#131920] border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4">Quick Commands</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/stego/image" className="p-3 rounded-lg bg-[#0B0F14] border border-slate-800 text-xs font-bold text-white hover:border-[#10B981]/50 transition-colors flex items-center gap-2">
              <Lock size={12} className="text-[#10B981]" /> Hide
            </Link>
            <Link to="/stego/extract" className="p-3 rounded-lg bg-[#0B0F14] border border-slate-800 text-xs font-bold text-white hover:border-[#10B981]/50 transition-colors flex items-center gap-2">
              <Search size={12} className="text-[#10B981]" /> Extract
            </Link>
            <Link to="/stego/scan" className="p-3 rounded-lg bg-[#0B0F14] border border-slate-800 text-xs font-bold text-white hover:border-[#10B981]/50 transition-colors flex items-center gap-2">
              <ScanLine size={12} className="text-[#10B981]" /> Scan
            </Link>
            <button
              type="button"
              disabled
              className="p-3 rounded-lg bg-[#0B0F14] border border-slate-800 text-xs font-bold text-white flex items-center gap-2 opacity-50 cursor-not-allowed"
            >
              <FileText size={12} /> Verify
            </button>
          </div>
        </div>
      </div>

      {/* ================= 7. STEGO ANALYTICS ================= */}
      <section className="rounded-3xl bg-[#131920] border border-slate-800 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white">Stego Analytics</h2>
          <button type="button" disabled className="text-xs font-bold text-[#10B981] flex items-center gap-1 opacity-50 cursor-not-allowed">
            View Full Analytics <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Ops', val: stats?.total_operations || 0 },
            { label: 'Success', val: (stats?.hides || 0) + (stats?.extracts || 0) },
            { label: 'Failed', val: stats?.failures || 0 },
            { label: 'Success Rate', val: successRate },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-[#0B0F14] border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{item.val}</p>
            </div>
          ))}
        </div>

        <div className="h-32 flex items-end gap-2 px-2">
          {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
            <div key={i} className="flex-1 bg-[#10B981]/20 rounded-t-sm relative group hover:bg-[#10B981]/40 transition-colors" style={{ height: `${h}%` }}>
              <div className="absolute bottom-0 w-full bg-[#10B981] rounded-t-sm" style={{ height: '4px' }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono px-2">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </section>

      {/* ================= 8. HELP & SUPPORT ================= */}
      <section className="rounded-3xl bg-[#131920] border border-slate-800 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">We're here to help.</h2>
          <p className="text-slate-400 text-sm mt-1">Facing an issue? Let us know and we'll help you out.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#0B0F14] border border-slate-800">
            <MessageSquare size={20} className="text-[#10B981] mb-3" />
            <h3 className="text-sm font-bold text-white mb-2">Report an Issue</h3>
            <p className="text-xs text-slate-400 mb-4">Bugs, technical problems, or feature requests.</p>
            <Link
              to="/help"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              <Send size={12} /> Submit Report
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B0F14] border border-slate-800">
            <LifeBuoy size={20} className="text-cyan-400 mb-3" />
            <h3 className="text-sm font-bold text-white mb-2">Contact Support</h3>
            <p className="text-xs text-slate-400 mb-4">Direct email support for critical issues.</p>
            <a
              href="mailto:support@stegavault.io"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              <Send size={12} /> Email Support
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B0F14] border border-slate-800">
            <FileText size={20} className="text-purple-400 mb-3" />
            <h3 className="text-sm font-bold text-white mb-2">Help Center & FAQs</h3>
            <p className="text-xs text-slate-400 mb-4">Guides, usage instructions, and troubleshooting.</p>
            <Link
              to="/help"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              <FileText size={12} /> Open Knowledge Base
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}