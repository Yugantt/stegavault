import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Calculator, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api, getApiErrorMessage } from '../lib/api'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CapacityModal({ isOpen, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [capacity, setCapacity] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    setFile(f)
    setLoading(true)
    setError(null)
    setCapacity(null)

    try {
      const formData = new FormData()
      formData.append('cover', f)
      const res = await api.post('/stego/capacity', formData)
      setCapacity(res.data.max_payload_bytes)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to analyze capacity'))
      setFile(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#0B0F14]/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-[#131920] border border-slate-800 rounded-2xl shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                <Calculator size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Capacity Calculator</h2>
                <p className="text-xs text-slate-400">How much can your image hold?</p>
              </div>
            </div>

            {!capacity && (
              <div
                onClick={() => document.getElementById('cap-input')?.click()}
                className="border-2 border-dashed border-slate-700 bg-[#0B0F14] rounded-xl p-8 text-center cursor-pointer hover:border-[#10B981]/50 transition-all h-[160px] flex flex-col items-center justify-center"
              >
                <input
                  id="cap-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
                {loading ? (
                  <span className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin mb-3" />
                ) : (
                  <Upload size={24} className="text-[#10B981] mb-3" />
                )}
                <p className="text-sm font-bold text-white">
                  {loading ? 'Analyzing...' : 'Upload an image'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, or BMP</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {capacity !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#10B981]/30 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    Max Payload Capacity
                  </p>
                  <p className="text-3xl font-extrabold text-[#10B981]">
                    {(capacity / 1024).toFixed(1)}{' '}
                    <span className="text-sm font-normal text-slate-400">KB</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    (~{Math.floor(capacity)} bytes)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 size={14} /> File analyzed successfully.
                </div>
                <button
                  onClick={() => {
                    setCapacity(null)
                    setFile(null)
                  }}
                  className="w-full py-2 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  Check Another File
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
