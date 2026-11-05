import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoaderProps {
  show: boolean
  title?: string
  subtitle?: string
  progress?: number // 0-100, optional. Agar na do to auto-simulate hoga
}

const DIGITS = ['1', '0', '1', '0', '1', '1', '0', '0', '1']

export default function Loader({
  show,
  title = 'Processing...',
  subtitle = 'Please wait, do not close this tab.',
  progress: externalProgress,
}: LoaderProps) {
  const [internalProgress, setInternalProgress] = useState(0)

  useEffect(() => {
    if (show && externalProgress === undefined) {
      setInternalProgress(0)
      const interval = setInterval(() => {
        setInternalProgress((p) => {
          if (p >= 90) return p
          return p + Math.random() * 6
        })
      }, 350)
      return () => clearInterval(interval)
    }
    if (!show) setInternalProgress(0)
  }, [show, externalProgress])

  const progress = Math.min(externalProgress ?? internalProgress, 100)
  const display = Math.floor(progress)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0B0F14]/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative flex flex-col items-center gap-5 px-8 py-8 rounded-3xl bg-[#131920] border border-slate-800 shadow-[0_0_60px_rgba(16,185,129,0.2)] max-w-sm w-[90%]"
          >
            {/* Matrix digits */}
            <div className="ai-matrix-loader">
              <div className="glow" />
              {DIGITS.map((d, i) => (
                <span key={i} className="digit">{d}</span>
              ))}
            </div>

            {/* Truck loader (slightly scaled down) */}
            <div className="loader" style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
              <div className="truckWrapper">
                <div className="truckBody">
                  <svg viewBox="0 0 130 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Cargo box */}
                    <rect x="2" y="12" width="78" height="40" rx="3" fill="#F3F3F3" stroke="#282828" strokeWidth="2" />
                    <line x1="15" y1="20" x2="65" y2="20" stroke="#282828" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="15" y1="27" x2="55" y2="27" stroke="#282828" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="15" y1="34" x2="60" y2="34" stroke="#282828" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Cab */}
                    <path d="M80 22 H100 L118 42 V52 H80 Z" fill="#F3F3F3" stroke="#282828" strokeWidth="2" strokeLinejoin="round" />
                    {/* Windshield */}
                    <path d="M85 27 H95 L105 40 H85 Z" fill="#5CB3FF" stroke="#282828" strokeWidth="1.5" strokeLinejoin="round" />
                    {/* Axles */}
                    <rect x="22" y="48" width="10" height="4" fill="#282828" />
                    <rect x="92" y="48" width="10" height="4" fill="#282828" />
                  </svg>
                </div>
                <div className="truckTires">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#282828" />
                    <circle cx="12" cy="12" r="5" fill="#F3F3F3" />
                    <circle cx="12" cy="12" r="2" fill="#282828" />
                  </svg>
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#282828" />
                    <circle cx="12" cy="12" r="5" fill="#F3F3F3" />
                    <circle cx="12" cy="12" r="2" fill="#282828" />
                  </svg>
                </div>
                <div className="road" />
              </div>
            </div>

            {/* Title + subtitle */}
            <div className="text-center space-y-1">
              <h3 className="text-white font-bold text-sm">{title}</h3>
              <p className="text-slate-400 text-xs">{subtitle}</p>
            </div>

            {/* Live progress bar */}
            <div className="w-full space-y-2">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#10B981] to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-500">PROCESSING</span>
                <span className="text-[#10B981] font-bold">{display}%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
