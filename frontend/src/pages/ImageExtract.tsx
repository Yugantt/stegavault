import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, CheckCircle2, AlertCircle,
  Eye, EyeOff, Download, RefreshCw, X,
  FileSearch, KeyRound, FileText, Image as ImageIcon, Music,
  ShieldCheck, Copy, Check,
} from 'lucide-react'
import { api, getApiErrorMessage } from '../lib/api'
import Loader from '../components/Loader'

type ExtractMode = 'image' | 'audio'
type ExtractedResult =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; filename: string }
  | null

const MODE_CONFIG = {
  image: {
    label: 'Image',
    Icon: ImageIcon,
    accept: 'image/*',
    endpoint: '/stego/extract',
    fieldName: 'stego',
    loaderTitle: 'Decoding Image...',
    mimePrefix: 'image/',
  },
  audio: {
    label: 'Audio',
    Icon: Music,
    accept: 'audio/wav,audio/mp3,audio/mpeg',
    endpoint: '/stego/extract/audio',
    fieldName: 'stego_file',
    loaderTitle: 'Decoding Audio...',
    mimePrefix: 'audio/',
  },
} as const

async function parseExtractResponse(
  data: Blob,
  contentType: string,
  baseName: string,
): Promise<ExtractedResult> {
  const ct = contentType.toLowerCase()

  if (ct.includes('application/json')) {
    const text = await data.text()
    try {
      const { secret, message } = JSON.parse(text)
      return { type: 'text', content: String(secret ?? message ?? text) }
    } catch {
      return { type: 'text', content: text }
    }
  }

  const mime = ct || 'image/png'
  const ext = mime.split('/')[1]?.split(';')[0] || 'png'
  return {
    type: 'image',
    url: URL.createObjectURL(new Blob([data], { type: mime })),
    filename: `${baseName}.${ext}`,
  }
}

export default function Extract() {
  const [mode, setMode] = useState<ExtractMode>('image')
  const [stegoFile, setStegoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [usePassword, setUsePassword] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaderTitle, setLoaderTitle] = useState('Decoding Secret...')
  const [loaderSubtitle, setLoaderSubtitle] = useState('Extracting payload')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ExtractedResult>(null)
  const [copied, setCopied] = useState(false)

  const copyTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  useEffect(() => {
    if (result?.type !== 'image') return
    return () => URL.revokeObjectURL(result.url)
  }, [result])

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current)
  }, [])

  const resetAll = () => {
    setStegoFile(null)
    setPreview(null)
    setPassword('')
    setUsePassword(false)
    setShowPassword(false)
    setResult(null)
    setError(null)
    setCopied(false)
  }

  const handleModeChange = (newMode: ExtractMode) => {
    if (mode === newMode) return
    setMode(newMode)
    resetAll()
  }

  const handleFileUpload = (file: File) => {
    const cfg = MODE_CONFIG[mode]
    if (file.type && !file.type.startsWith(cfg.mimePrefix)) {
      setError(`Please upload a valid ${cfg.label.toLowerCase()} file.`)
      return
    }
    setError(null)
    setResult(null)
    setStegoFile(file)
    setPreview(mode === 'image' ? URL.createObjectURL(file) : null)
  }

  const handleExtract = async () => {
    if (!stegoFile) return setError('Please upload a file first.')
    if (usePassword && !password) return setError('Please enter the password.')

    const cfg = MODE_CONFIG[mode]
    setError(null)
    setResult(null)
    setLoaderTitle(cfg.loaderTitle)
    setLoaderSubtitle(usePassword ? 'Decrypting with password' : 'Extracting hidden payload')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append(cfg.fieldName, stegoFile)
      if (usePassword) formData.append('password', password)

      const res = await api.post(cfg.endpoint, formData, { responseType: 'blob' })
      const parsed = await parseExtractResponse(
        res.data as Blob,
        String(res.headers['content-type'] || ''),
        `extracted_${mode}_${Date.now()}`,
      )
      setResult(parsed)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Extraction failed. Wrong password or corrupted file.'))
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (result?.type !== 'text') return
    await navigator.clipboard.writeText(result.content)
    setCopied(true)
    if (copyTimer.current) window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 selection:bg-emerald-500 selection:text-black">
      <Loader show={loading} title={loaderTitle} subtitle={loaderSubtitle} />

      {/* HERO */}
      <div className="rounded-2xl bg-[#131920] border border-slate-800 p-6 md:p-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono uppercase tracking-wider">
              Extract Secret
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Reveal What's <span className="text-[#10B981]">Hidden Inside.</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Upload a stego file to extract the concealed payload.</p>
        </div>
        <FileSearch size={48} className="text-emerald-500/20 hidden md:block" />
      </div>

      {/* MODE TOGGLE */}
      <div className="flex p-1 bg-[#131920] border border-slate-800 rounded-xl max-w-xs">
        {(['image', 'audio'] as const).map((m) => {
          const { Icon, label } = MODE_CONFIG[m]
          const active = mode === m
          return (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${
                active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle2 size={48} className="text-[#10B981] mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white">Secret Extracted Successfully</h2>
              <p className="text-xs text-slate-400">Payload decoded from {stegoFile?.name ?? 'file'}</p>
            </div>

            {result.type === 'text' && (
              <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText size={14} className="text-[#10B981]" /> Hidden Text
                  </h3>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <><Check size={12} className="text-[#10B981]" /> Copied</>
                    ) : (
                      <><Copy size={12} /> Copy</>
                    )}
                  </button>
                </div>
                <div className="bg-[#0B0F14] border border-slate-800 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                  <pre className="text-xs text-slate-200 whitespace-pre-wrap break-words font-mono">{result.content}</pre>
                </div>
                <p className="text-[10px] text-slate-500">
                  {new TextEncoder().encode(result.content).length} bytes extracted
                </p>
              </div>
            )}

            {result.type === 'image' && (
              <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-[#10B981]" /> Hidden Image
                </h3>
                <div className="bg-[#0B0F14] border border-slate-800 rounded-xl p-3 flex items-center justify-center">
                  <img src={result.url} alt="Extracted" className="max-h-[400px] rounded-lg object-contain" />
                </div>
                <a
                  href={result.url}
                  download={result.filename}
                  className="w-full py-3 rounded-xl bg-[#10B981] text-black font-bold text-sm hover:bg-emerald-400 flex items-center justify-center gap-2"
                >
                  <Download size={16} /> DOWNLOAD EXTRACTED IMAGE
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={resetAll}
              className="w-full py-3 rounded-xl border border-slate-700 text-white text-sm font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Extract Another Secret
            </button>
          </motion.div>
        ) : (
          <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Upload size={14} className="text-[#10B981]" /> Upload Stego {MODE_CONFIG[mode].label}
              </h3>

              {!stegoFile ? (
                <div
                  onClick={() => document.getElementById('stego-in')?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="border-2 border-dashed border-slate-700 bg-[#0B0F14] rounded-xl p-8 text-center cursor-pointer hover:border-[#10B981]/50 transition-all h-[200px] flex flex-col items-center justify-center"
                >
                  <input
                    id="stego-in"
                    type="file"
                    accept={MODE_CONFIG[mode].accept}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                  />
                  {(() => {
                    const Icon = MODE_CONFIG[mode].Icon
                    return <Icon size={32} className="text-[#10B981] mb-3" />
                  })()}
                  <p className="text-sm font-bold text-white">Drop your {mode} file here</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#10B981]/50 flex items-center gap-4">
                  {mode === 'image' && preview ? (
                    <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Music size={24} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-[#10B981] shrink-0" />
                      <p className="text-sm font-bold text-white truncate">{stegoFile.name}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{(stegoFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setStegoFile(null); setPreview(null) }}
                    aria-label="Remove file"
                    className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <KeyRound size={14} className="text-[#10B981]" /> Password Required?
                </h3>
                <button
                  type="button"
                  role="switch"
                  aria-checked={usePassword}
                  aria-label="Toggle password requirement"
                  onClick={() => setUsePassword((v) => !v)}
                  className={`w-9 h-5 rounded-full relative transition-colors ${usePassword ? 'bg-[#10B981]' : 'bg-slate-700'}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      usePassword ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {usePassword ? (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter decryption password"
                    className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 pr-10 text-xs text-white focus:border-[#10B981] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 bg-slate-800/40 p-2 rounded border border-slate-800">
                  Leave this off if the file was hidden without a password.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleExtract}
              disabled={!stegoFile || loading}
              className="w-full py-4 rounded-xl bg-[#10B981] text-black font-extrabold text-base hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <><ShieldCheck size={18} /> EXTRACT HIDDEN SECRET</>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}