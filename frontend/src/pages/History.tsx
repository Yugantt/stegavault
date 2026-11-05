import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Lock, Search, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, Filter, TrendingUp, ShieldCheck, FileText,
  ChevronLeft, ChevronRight, Activity
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'
import type { HistoryStats, HistoryList, HistoryEntry } from '../types'
import Loader from '../components/Loader'

type FilterType = 'all' | 'hide' | 'extract' | 'failed'

const PAGE_SIZE = 20

export default function History() {
  const [stats, setStats] = useState<HistoryStats | null>(null)
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loaderTitle, setLoaderTitle] = useState('Fetching Logs...')
  const [loaderSubtitle, setLoaderSubtitle] = useState('Loading your operation history')
  const [error, setError] = useState<string | null>(null)

  const [filter, setFilter] = useState<FilterType>('all')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  // Fetch stats once + first page
  useEffect(() => {
    let mounted = true
    const fetchInitial = async () => {
      setLoading(true)
      setLoaderTitle('Fetching Logs...')
      setLoaderSubtitle('Loading your operation history')
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get<HistoryStats>('/history/stats').catch(() => ({ data: null })),
          api.get<HistoryList>(`/history?limit=${PAGE_SIZE}&offset=0`).catch(() => ({
            data: { items: [] },
          })),
        ])
        if (mounted) {
          setStats(statsRes.data)
          setEntries(historyRes.data?.items || [])
          setHasMore((historyRes.data?.items || []).length === PAGE_SIZE)
        }
      } catch (err) {
        if (mounted) setError(getApiErrorMessage(err, 'Failed to load history'))
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialLoad(false)
        }
      }
    }
    fetchInitial()
    return () => {
      mounted = false
    }
  }, [])

  // Load more
  const loadMore = async () => {
    setLoading(true)
    setLoaderTitle('Loading More...')
    setLoaderSubtitle('Fetching next batch of logs')
    try {
      const res = await api.get<HistoryList>(
        `/history?limit=${PAGE_SIZE}&offset=${offset + PAGE_SIZE}`
      )
      const items = res.data?.items || []
      setEntries((prev) => [...prev, ...items])
      setOffset((o) => o + PAGE_SIZE)
      setHasMore(items.length === PAGE_SIZE)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load more'))
    } finally {
      setLoading(false)
    }
  }

  // Filter client-side
  const filtered = entries.filter((e) => {
    if (filter === 'all') return true
    if (filter === 'failed') return e.status !== 'success'
    return e.action === filter
  })

  const resetView = () => {
    setFilter('all')
    setOffset(0)
    setHasMore(true)
    window.location.reload()
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 selection:bg-emerald-500 selection:text-black">

      {/* Premium fullscreen loader */}
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
          <p className="text-slate-400 text-sm mt-1">
            Every hide and extract action, tracked in real time.
          </p>
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
        {[
          {
            label: 'Total Operations',
            val: stats?.total_operations ?? 0,
            icon: Activity,
            color: 'text-white',
            bg: 'bg-slate-800',
          },
          {
            label: 'Hides',
            val: stats?.hides ?? 0,
            icon: Lock,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Extracts',
            val: stats?.extracts ?? 0,
            icon: Search,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
          },
          {
            label: 'Failed',
            val: stats?.failures ?? 0,
            icon: XCircle,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
          },
        ].map((s, i) => (
          <motion.div
            key={i}
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
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.val}</p>
          </motion.div>
        ))}
      </div>

      {/* FILTER + LIST */}
      <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-4">

        {/* Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#0B0F14] border border-slate-800 rounded-xl">
            {[
              { id: 'all', label: 'All', icon: Filter },
              { id: 'hide', label: 'Hide', icon: Lock },
              { id: 'extract', label: 'Extract', icon: Search },
              { id: 'failed', label: 'Failed', icon: XCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as FilterType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  filter === tab.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={resetView}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Loading skeleton (initial) */}
        {initialLoad ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-[#0B0F14] border border-slate-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-white">No operations found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'all'
                ? "You haven't performed any hide or extract operations yet."
                : `No ${filter} operations found.`}
            </p>
            <Link
              to="/stego/image"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-[#10B981] text-black text-xs font-bold hover:bg-emerald-400"
            >
              <Lock size={12} /> Start Hiding
            </Link>
          </div>
        ) : (
          /* List */
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#0B0F14] border border-slate-800/70 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        item.action === 'hide'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-cyan-500/10 text-cyan-400'
                      }`}
                    >
                      {item.action === 'hide' ? <Lock size={14} /> : <Search size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{item.filename}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                        <span className="text-[10px] text-slate-600">•</span>
                        <span className="text-[10px] text-slate-400 capitalize">{item.action}</span>
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
                      {item.status === 'success' ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <XCircle size={10} />
                      )}
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load more */}
            {hasMore && filter === 'all' && (
              <div className="flex justify-center pt-3">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading ? (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Load More <ChevronRight size={12} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer summary */}
      {!initialLoad && filtered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-[#10B981]" />
            Showing <span className="text-white font-bold">{filtered.length}</span> of{' '}
            <span className="text-white font-bold">{entries.length}</span> operations
          </div>
          <div className="font-mono">
            {offset + entries.length} total loaded
          </div>
        </div>
      )}
    </div>
  )
}
