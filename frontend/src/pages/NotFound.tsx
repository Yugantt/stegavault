import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Lock, ShieldAlert, Compass } from 'lucide-react'

// Module-level constant — no hook needed, computed once on import
const BINARY_DIGITS = Array.from({ length: 30 }, () => ({
  char: Math.random() > 0.5 ? '1' : '0',
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: Math.random() * 3,
  duration: 3 + Math.random() * 3,
}))

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center relative overflow-hidden">

      {/* Floating binary rain background */}
      <div className="absolute inset-0 pointer-events-none">
        {BINARY_DIGITS.map((d, i) => (
          <motion.span
            key={i}
            className="absolute text-[#10B981]/30 font-mono text-xs select-none"
            style={{ left: d.left, top: d.top }}
            animate={{ y: [0, 30, 0], opacity: [0.1, 0.7, 0.1] }}
            transition={{
              duration: d.duration,
              delay: d.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {d.char}
          </motion.span>
        ))}
      </div>

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-lg mx-auto px-6"
      >
        <div className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono uppercase tracking-wider">
          <ShieldAlert size={12} /> Signal Lost — 404
        </div>

        {/* Glitchy 404 */}
        <div className="relative">
          <h1 className="text-[110px] md:text-[160px] font-black text-white leading-none font-mono tracking-tighter select-none">
            4
            <motion.span
              className="text-[#10B981] inline-block"
              animate={{ x: [0, -3, 3, -1, 0], opacity: [1, 0.6, 1, 0.85, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              style={{ textShadow: '0 0 30px rgba(16,185,129,0.6)' }}
            >
              0
            </motion.span>
            4
          </h1>
          <div className="absolute inset-0 blur-[80px] bg-emerald-500/15 -z-10" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">
          Secret Not Found
        </h2>
        <p className="text-sm text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed">
          The route you're looking for has been hidden too deep. Or maybe it never existed at
          all. Either way — it's not here.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-[#10B981] text-black font-bold text-sm hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Home size={14} /> Back to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>

        {/* Footer code tag */}
        <div className="mt-10 flex items-center justify-center gap-3 text-[10px] text-slate-600 font-mono">
          <span className="flex items-center gap-1">
            <Lock size={10} /> 0x04 — ROUTE_NOT_FOUND
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Compass size={10} /> Try /dashboard or /help
          </span>
        </div>
      </motion.div>
    </div>
  )
}
