import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Upload, Lock, CheckCircle2, AlertCircle,
  Eye, EyeOff, Download, RefreshCw, X,
  FileSearch, KeyRound, FileText, Image as ImageIcon, Music,
  ShieldCheck, Copy, Check
} from 'lucide-react'
import { api, getApiErrorMessage } from '../lib/api'
import Loader from '../components/Loader'

type ExtractMode = 'image' | 'audio'
type ExtractedResult =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; filename: string }
  | null

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

  // Cleanup URLs
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
      if (result?.type === 'image') URL.revokeObjectURL(result.url)
    }
  }, [preview, result])

  // Reset when mode changes
  const handleModeChange = (newMode: ExtractMode) => {
    if (mode === newMode) return
    setMode(newMode)
    setStegoFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  const handleFileUpload = (file: File) => {
    setError(null)
    setResult(null)
    setStegoFile(file)
    if (mode === 'image') {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(null) // Audio doesn't need preview
    }
  }

  const handleExtract = async () => {
    if (!stegoFile) return setError('Please upload a file first.')
    if (usePassword && !password) return setError('Please enter the password.')

    setError(null)
    setResult(null)
    setLoaderTitle(mode === 'image' ? 'Decoding Image...' : 'Decoding Audio...')
    setLoaderSubtitle(usePassword ? 'Decrypting with password' : 'Extracting hidden payload')
    setLoading(true)

    try {
      const formData = new FormData()
      
      if (mode === 'image') {
        formData.append('stego', stegoFile)
        if (usePassword && password) formData.append('password', password)
        
        const res = await api.post('/stego/extract', formData, { responseType: 'blob' })
        const contentType = (res.headers['content-type'] || '').toString().toLowerCase()

        if (contentType.includes('application/json')) {
          const text = await (res.data as Blob).text()
          const data = JSON.parse(text)
          const content = data.secret ?? data.message ?? JSON.stringify(data)
          setResult({ type: 'text', content: String(content) })
        } else {
          const blob = new Blob([res.data], { type: contentType || 'image/png' })
          setResult({ type: 'image', url: URL.createObjectURL(blob), filename: `extracted_${stegoFile.name}` })
        }
      } else {
        // AUDIO EXTRACT
        formData.append('stego_file', stegoFile)
        if (usePassword && password) formData.append('password', password)
        
        const res = await api.post('/stego/extract/audio', formData, { responseType: 'blob' })
        
        const contentType = (res.headers['content-type'] || '').toString().toLowerCase()

        if (contentType.includes('application/json')) {
          const text = await (res.data as Blob).text()
          const data = JSON.parse(text)
          setResult({ type: 'text', content: String(data.secret) })
        } else {
          // It's an image
          const blob = new Blob([res.data], { type: 'image/png' })
          setResult({ type: 'image', url: URL.createObjectURL(blob), filename: extracted_audio_image.png })
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Extraction failed. Wrong password or corrupted file.'))
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setStegoFile(null)
    setPreview(null)
    setPassword('')
    setUsePassword(false)
    setResult(null)
    setError(null)
    setCopied(false)
  }

  const copyToClipboard = async () => {
    if (result?.type === 'text') {
      await navigator.clipboard.writeText(result.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
        <button
          onClick={() => handleModeChange('image')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${mode === 'image' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <ImageIcon size={14} /> Image
        </button>
        <button
          onClick={() => handleModeChange('audio')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${mode === 'audio' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Music size={14} /> Audio
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {result ? (
          /* RESULT VIEW */
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle2 size={48} className="text-[#10B981] mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white">Secret Extracted Successfully</h2>
              <p className="text-xs text-slate-400">Payload decoded from {stegoFile?.name}</p>
            </div>

            {result.type === 'text' && (
              <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText size={14} className="text-[#10B981]" /> Hidden Text
                  </h3>
                  <button onClick={copyToClipboard} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 flex items-center gap-1.5 transition-colors">
                    {copied ? <><Check size={12} className="text-[#10B981]" /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <div className="bg-[#0B0F14] border border-slate-800 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                  <pre className="text-xs text-slate-200 whitespace-pre-wrap break-words font-mono">{result.content}</pre>
                </div>
                <p className="text-[10px] text-slate-500">{new TextEncoder().encode(result.content).length} bytes extracted</p>
              </div>
            )}

            {result.type === 'image' && (
              <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5"><ImageIcon size={14} className="text-[#10B981]" /> Hidden Image</h3>
                <div className="bg-[#0B0F14] border border-slate-800 rounded-xl p-3 flex items-center justify-center">
                  <img src={result.url} alt="Extracted" className="max-h-[400px] rounded-lg object-contain" />
                </div>
                <a href={result.url} download={result.filename} className="w-full py-3 rounded-xl bg-[#10B981] text-black font-bold text-sm hover:bg-emerald-400 flex items-center justify-center gap-2">
                  <Download size={16} /> DOWNLOAD EXTRACTED IMAGE
                </a>
              </div>
            )}

            <button onClick={resetAll} className="w-full py-3 rounded-xl border border-slate-700 text-white text-sm font-bold hover:bg-slate-800 flex items-center justify-center gap-2">
              <RefreshCw size={14} /> Extract Another Secret
            </button>
          </motion.div>
        ) : (
          /* INPUT VIEW */
          <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Upload size={14} className="text-[#10B981]" /> Upload Stego {mode === 'image' ? 'Image' : 'Audio'}
              </h3>

              {!stegoFile ? (
                <div
                  onClick={() => document.getElementById('stego-in')?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]) }}
                  className="border-2 border-dashed border-slate-700 bg-[#0B0F14] rounded-xl p-8 text-center cursor-pointer hover:border-[#10B981]/50 transition-all h-[200px] flex flex-col items-center justify-center"
                >
                  <input
                    id="stego-in" type="file"
                    accept={mode === 'image' ? 'image/*' : 'audio/wav, audio/mp3, audio/mpeg'}
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]) }}
                  />
                  {mode === 'image' ? <Upload size={32} className="text-[#10B981] mb-3" /> : <Music size={32} className="text-[#10B981] mb-3" />}
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
                  <button onClick={() => { setStegoFile(null); setPreview(null) }} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg shrink-0"><X size={14} /></button>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5"><KeyRound size={14} className="text-[#10B981]" /> Password Required?</h3>
                <button onClick={() => setUsePassword(!usePassword)} className={`w-8 h-4 rounded-full relative transition-colors ${usePassword ? 'bg-[#10B981]' : 'bg-slate-700'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white absolute transition-transform ${usePassword ? 'translate-x-4' : 'translate-x-0.5'}`} style={{ top: '2px' }} />
                </button>
              </div>

              {usePassword ? (
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter decryption password" className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:border-[#10B981] outline-none" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 bg-slate-800/40 p-2 rounded border border-slate-800">Leave this off if the file was hidden without a password.</p>
              )}
            </div>

            <button
              onClick={handleExtract}
              disabled={!stegoFile || loading}
              className="w-full py-4 rounded-xl bg-[#10B981] text-black font-extrabold text-base hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><ShieldCheck size={18} /> EXTRACT HIDDEN SECRET</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

