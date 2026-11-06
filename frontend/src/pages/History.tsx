import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Lock, Search, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, Filter as FilterIcon, TrendingUp, FileText,
  ChevronRight, Activity, Image as ImageIcon, Music, Video,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'
import type { HistoryStats, HistoryList, HistoryEntry } from '../types'
import Loader from '../components/Loader'

type FilterType = 'all' | 'hide' | 'extract' | 'failed'

const PAGE_SIZE = 20

const STAT_CARDS = [
  { label: 'Total Operations', key: 'total_operations', icon: Activity, color: 'text-white', bg: 'bg-slate-800' },
  { label: 'Hides', key: 'hides', icon: Lock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Extracts', key: 'extracts', icon: Search, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { label: 'Failed', key: 'failures', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
] as const

const FILTER_TABS = [
  { id: 'all', label: 'All', icon: FilterIcon },
  { id: 'hide', label: 'Hide', icon: Lock },
  { id: 'extract', label: 'Extract', icon: Search },
  { id: 'failed', label: 'Failed', icon: XCircle },
] as const

const MODULE_ICON = { image: ImageIcon, audio: Music, video: Video } as const

function matchesFilter(entry: HistoryEntry, filter: FilterType): boolean {
  if (filter === 'all') return true
  if (filter === 'failed') return entry.status !== 'success'
  return entry.action === filter
}

async function fetchHistoryData() {
  const results = await Promise.allSettled([
    api.get<HistoryStats>('/history/stats'),
    api.get<HistoryList>(`/history?limit=${PAGE_SIZE}&offset=0`),
  ])
  const [statsRes, historyRes] = results
  const items = historyRes.status === 'fulfilled' ? (historyRes.value.data?.items ?? []) : []
  return {
    stats: statsRes.status === 'fulfilled' ? statsRes.value.data : null,
    items,
    hasMore: items.length === PAGE_SIZE,
    bothFailed: results.every((r) => r.status === 'rejected'),
    firstError: results[0].status === 'rejected' ? results[0].reason : null,
  }
}

export default function History() {
  const [stats, setStats] = useState<HistoryStats | null>(null)
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loaderTitle, setLoaderTitle] = useState('Fetching Logs...')
  const [loaderSubtitle, setLoaderSubtitle] = useState('Loading your operation history')
  const [error, setError] = useState<string | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)

  const [filter, setFilter] = useState<FilterType>('all')
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      const data = await fetchHistoryData()
      if (cancelled) return
      if (data.stats) setStats(data.stats)
      setEntries(data.items)
      setHasMore(data.hasMore)
      if (data.bothFailed) {
        setError(getApiErrorMessage(data.firstError, 'Failed to load history'))
      }
      setLoading(false)
      setInitialLoad(false)
    })()
    return () => { cancelled = true }
  }, [])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    setError(null)
    try {
      const res = await api.get<HistoryList>(`/history?limit=${PAGE_SIZE}&offset=${entries.length}`)
      const items = res.data?.items ?? []
      setEntries((prev) => [...prev, ...items])
      setHasMore(items.length === PAGE_SIZE)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load more'))
    } finally {
      setLoadingMore(false)
    }
  }

  const refresh = async () => {
    setLoaderTitle('Refreshing...')
    setLoaderSubtitle('Reloading your operation history')
    setLoading(true)
    setError(null)
    const data = await fetchHistoryData()
    if (data.stats) setStats(data.stats)
    setEntries(data.items)
    setHasMore(data.hasMore)
    if (data.bothFailed) {
      setError(getApiErrorMessage(data.firstError, 'Failed to load history'))
    }
    setLoading(false)
  }

  const filtered = entries.filter((e) => matchesFilter(e, filter))

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 selection:bg-emerald-500 selection:text-black">
      <Loader show={loading && !initialLoad} title={loaderTitle} subtitle={loaderSubtitle} />

      {/* HERO */}
      <div className="rounded-2xl bg-[#131920] border border-slate-800 p-6 md:p-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
              Operation History
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Your Complete <span className="text-[#10B981]">Operation Timeline.</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Every hide and extract action, tracked in real time.</p>
        </div>
        <Clock size={48} className="text-emerald-500/20 hidden md:block" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-[#131920] border border-slate-800"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                <s.icon size={16} />
              </div>
              <TrendingUp size={14} className="text-slate-600" />
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{stats?.[s.key] ?? 0}</p>
          </motion.div>
        ))}
      </div>

      {/* FILTER + LIST */}
      <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#0B0F14] border border-slate-800 rounded-xl">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  filter === tab.id ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                <tab.icon size={12} /> {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {initialLoad ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-[#0B0F14] border border-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-white">No operations found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'all'
                ? "You haven't performed any operations yet."
                : `No ${filter} operations found in the loaded entries.`}
            </p>
            <Link
              to="/stego/image"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-[#10B981] text-black text-xs font-bold hover:bg-emerald-400"
            >
              <Lock size={12} /> Start Hiding
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {filtered.map((item, i) => {
                const Icon = MODULE_ICON[item.module as keyof typeof MODULE_ICON] ?? ImageIcon
                const actionColor =
                  item.action === 'hide'
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-cyan-400 bg-cyan-500/10'

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i, 10) * 0.02 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#0B0F14] border border-slate-800/70 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${actionColor}`}>
                        {item.action === 'hide' ? <Lock size={14} /> : <Search size={14} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">{item.filename}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                          <span className="text-[10px] text-slate-600">•</span>
                          <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                            <Icon size={10} /> {item.module} {item.action}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          item.status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {item.status === 'success' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {hasMore && (
              <div className="flex justify-center pt-3">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loadingMore ? (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><ChevronRight size={12} /> Load More</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}