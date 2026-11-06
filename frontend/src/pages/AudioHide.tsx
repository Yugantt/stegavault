import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music, Upload, FileText, Lock, CheckCircle2, AlertCircle,
  Eye, EyeOff, Download, RefreshCw, X,
  ShieldCheck, KeyRound, ArrowLeft, Image as ImageIcon,
} from 'lucide-react'
import { api, getApiErrorMessage } from '../lib/api'
import Loader from '../components/Loader'

type Step = 1 | 2 | 3
type PayloadType = 'text' | 'image'
type EmbedResult = { url: string; name: string; isEncrypted: boolean }

const STRENGTH_BG = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400'] as const

function getStrength(pass: string): number {
  let score = 0
  if (pass.length >= 8) score++
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++
  if (/\d/.test(pass)) score++
  if (/[^A-Za-z0-9]/.test(pass)) score++
  return score
}

export default function AudioHide() {
  const [step, setStep] = useState<Step>(1)
  const [carrier, setCarrier] = useState<File | null>(null)
  const [capacity, setCapacity] = useState(0)

  const [payloadType, setPayloadType] = useState<PayloadType>('text')
  const [secretText, setSecretText] = useState('')
  const [secretImage, setSecretImage] = useState<File | null>(null)

  const [usePassword, setUsePassword] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [loaderTitle, setLoaderTitle] = useState('Processing...')
  const [loaderSubtitle, setLoaderSubtitle] = useState('Please wait.')
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<EmbedResult[]>([])

  useEffect(() => {
    if (results.length === 0) return
    return () => results.forEach((r) => URL.revokeObjectURL(r.url))
  }, [results])

  const clearCarrier = () => {
    setCarrier(null)
    setCapacity(0)
  }

  const handleCarrierUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please upload a valid audio file (WAV or MP3).')
      return
    }
    setError(null)
    setLoaderTitle('Analyzing Audio...')
    setLoaderSubtitle('Checking MP3/WAV capacity')
    setCarrier(file)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('cover', file)
      const res = await api.post('/stego/capacity/audio', formData)
      setCapacity(res.data.max_payload_bytes)
      setStep(2)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to analyze audio capacity'))
      clearCarrier()
    } finally {
      setLoading(false)
    }
  }

  const handleEmbed = async () => {
    if (!carrier) return
    setError(null)
    setLoaderTitle(usePassword ? 'Encrypting & Hiding...' : 'Hiding Secret...')
    setLoaderSubtitle('Embedding payload into audio samples')
    setLoading(true)

    const createdUrls: string[] = []

    try {
      const makeRequest = async (withPassword: boolean): Promise<EmbedResult> => {
        const formData = new FormData()
        formData.append('cover', carrier)
        if (payloadType === 'text') formData.append('secret', secretText)
        else if (secretImage) formData.append('secret_image', secretImage)
        if (withPassword) formData.append('password', password)

        const res = await api.post('/stego/hide/audio', formData, { responseType: 'blob' })

        const isMp3 = carrier.name.toLowerCase().endsWith('.mp3')
        const mimeType = isMp3 ? 'audio/mpeg' : 'audio/wav'
        const outExt = isMp3 ? '.mp3' : '.wav'
        const baseName = carrier.name.replace(/\.[^/.]+$/, '')
        const outName = withPassword ? `secure_${baseName}${outExt}` : `raw_${baseName}${outExt}`
        const url = URL.createObjectURL(new Blob([res.data], { type: mimeType }))
        createdUrls.push(url)

        return { url, name: outName, isEncrypted: withPassword }
      }

      const newResults = usePassword
        ? await Promise.all([makeRequest(true), makeRequest(false)])
        : [await makeRequest(false)]

      setResults(newResults)
      setStep(3)
    } catch (err) {
      createdUrls.forEach(URL.revokeObjectURL)
      setError(getApiErrorMessage(err, 'Embedding failed.'))
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setStep(1)
    clearCarrier()
    setPayloadType('text')
    setSecretText('')
    setSecretImage(null)
    setUsePassword(true)
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setResults([])
    setError(null)
  }

  const strength = getStrength(password)
  const textBytes = new TextEncoder().encode(secretText).length
  const payloadBytes = payloadType === 'text' ? textBytes : secretImage?.size ?? 0
  const isPayloadValid = payloadType === 'text' ? secretText.trim().length > 0 : secretImage !== null
  const isCapacityOk = payloadBytes > 0 && payloadBytes <= capacity
  const isPasswordValid = !usePassword || (password.length >= 8 && password === confirmPassword)
  const canEmbed = isPayloadValid && isCapacityOk && isPasswordValid && !loading

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 selection:bg-emerald-500 selection:text-black">
      <Loader show={loading} title={loaderTitle} subtitle={loaderSubtitle} />

      {/* HERO */}
      <div className="rounded-2xl bg-[#131920] border border-slate-800 p-6 md:p-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
              Audio Studio
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Hide Your Secret. <span className="text-[#10B981]">Inside Sound.</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Embed encrypted text or images inside WAV/MP3 audio files.</p>
        </div>
        <Music size={48} className="text-emerald-500/20 hidden md:block" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="text-lg font-bold text-white">Upload Audio File</h2>
            {!carrier ? (
              <div
                onClick={() => document.getElementById('c-in')?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleCarrierUpload(file)
                }}
                className="border-2 border-dashed border-slate-700 bg-[#131920] rounded-2xl p-8 text-center cursor-pointer hover:border-[#10B981]/50 transition-all h-[220px] flex flex-col items-center justify-center"
              >
                <input
                  id="c-in"
                  type="file"
                  accept="audio/wav,audio/mp3,audio/mpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleCarrierUpload(file)
                  }}
                />
                <Upload size={32} className="text-[#10B981] mb-3" />
                <p className="text-sm font-bold text-white">Drag & Drop your WAV or MP3 file</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse</p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#131920] border border-[#10B981]/50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Music size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#10B981]" />
                    <p className="text-sm font-bold text-white">{carrier.name}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(carrier.size / 1024).toFixed(1)} KB • Capacity: {(capacity / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearCarrier}
                  aria-label="Remove audio file"
                  className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Add Secret Payload</h2>
              <button
                type="button"
                onClick={() => { setStep(1); clearCarrier() }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft size={12} /> Back
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Payload */}
              <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3">
                <div className="flex gap-2 p-1 bg-[#0B0F14] border border-slate-800 rounded-lg mb-3">
                  {(['text', 'image'] as const).map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setPayloadType(pt)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-bold capitalize ${
                        payloadType === pt ? 'bg-slate-800 text-white' : 'text-slate-500'
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>

                {payloadType === 'text' ? (
                  <>
                    <textarea
                      rows={5}
                      value={secretText}
                      onChange={(e) => setSecretText(e.target.value)}
                      placeholder="Type your secret message here..."
                      className="w-full bg-[#0B0F14] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-[#10B981] outline-none resize-none"
                    />
                    <p className={`text-[10px] ${textBytes > capacity ? 'text-red-400' : 'text-slate-500'}`}>
                      {textBytes} / {capacity} bytes
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      className="border-2 border-dashed border-slate-700 bg-[#0B0F14] rounded-xl p-6 text-center cursor-pointer hover:border-[#10B981]/50"
                      onClick={() => document.getElementById('p-in')?.click()}
                    >
                      <input
                        id="p-in"
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setSecretImage(file)
                        }}
                      />
                      <ImageIcon size={24} className="mx-auto text-slate-500 mb-2" />
                      <p className="text-xs font-bold text-white">
                        {secretImage ? secretImage.name : 'Upload Secret Image'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {secretImage ? `${(secretImage.size / 1024).toFixed(1)} KB` : 'Click to browse'}
                      </p>
                    </div>
                    {secretImage && (
                      <p className={`text-[10px] ${payloadBytes > capacity ? 'text-red-400' : 'text-slate-500'}`}>
                        {payloadBytes} / {capacity} bytes
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Password */}
              <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <KeyRound size={14} className="text-[#10B981]" /> Password Protection
                  </h3>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={usePassword}
                    aria-label="Toggle password protection"
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
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2 pr-10 text-xs text-white focus:border-[#10B981] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                      >
                        {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-[#10B981] outline-none"
                    />
                    <div className="flex gap-1 h-1 rounded-full overflow-hidden">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 ${i < strength ? STRENGTH_BG[strength] : 'bg-slate-800'}`}
                        />
                      ))}
                    </div>
                    {password && password !== confirmPassword && (
                      <p className="text-[10px] text-amber-500">Passwords do not match.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                    No encryption. Data will be visible.
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleEmbed}
              disabled={!canEmbed}
              className="w-full py-3 rounded-xl bg-[#10B981] text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} /> {usePassword ? 'Encrypt & Embed in Audio' : 'Embed in Audio'}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle2 size={48} className="text-[#10B981] mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white">Secret Embedded Successfully</h2>
              <p className="text-xs text-slate-400">Your audio file is ready.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {results.map((res) => (
                <div
                  key={res.url}
                  className="rounded-2xl bg-[#131920] border border-slate-800 p-5 text-center space-y-3"
                >
                  <div
                    className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                      res.isEncrypted ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {res.isEncrypted ? <Lock size={16} /> : <FileText size={16} />}
                  </div>
                  <h3 className="text-xs font-bold text-white">
                    {res.isEncrypted ? 'Encrypted Version' : 'Unencrypted Version'}
                  </h3>
                  <a
                    href={res.url}
                    download={res.name}
                    className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                      res.isEncrypted ? 'bg-[#10B981] text-black' : 'bg-slate-800 text-white'
                    }`}
                  >
                    <Download size={12} /> DOWNLOAD {res.name.split('.').pop()?.toUpperCase()}
                  </a>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={resetAll}
              className="w-full py-2 rounded-xl border border-slate-700 text-white text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={12} /> Start New Operation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}