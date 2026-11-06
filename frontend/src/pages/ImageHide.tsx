import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Image as ImageIcon, Music, Video, Globe,
  Upload, FileText, Lock, CheckCircle2, AlertCircle,
  Eye, EyeOff, ArrowRight, Download, RefreshCw, X,
  ShieldCheck, KeyRound, ArrowLeft,
} from 'lucide-react'
import { api, getApiErrorMessage } from '../lib/api'
import Loader from '../components/Loader'

type Step = 1 | 2 | 3 | 4 | 5
type Operation = 'image' | 'audio' | 'video' | 'cross'
type PayloadType = 'text' | 'image'
type EmbedResult = { url: string; name: string; isEncrypted: boolean }

const STRENGTH_LABELS = ['Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'] as const
const STRENGTH_BG = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400'] as const
const STRENGTH_TEXT = ['text-red-500', 'text-red-500', 'text-amber-500', 'text-emerald-500', 'text-emerald-400'] as const

const OPERATIONS = [
  { id: 'image', title: 'Image Hide', desc: 'PNG, JPG, BMP', icon: ImageIcon, active: true },
  { id: 'audio', title: 'Audio Hide', desc: 'WAV, MP3', icon: Music, active: true },
  { id: 'video', title: 'Video Hide', desc: 'MP4, AVI', icon: Video, active: false },
  { id: 'cross', title: 'Cross Media', desc: 'Any to Any', icon: Globe, active: false },
] as const

const STEPS = [
  { num: 1, label: 'Operation' },
  { num: 2, label: 'Carrier' },
  { num: 3, label: 'Payload' },
  { num: 4, label: 'Embed' },
] as const

function getStrength(pass: string): number {
  let score = 0
  if (pass.length >= 8) score++
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++
  if (/\d/.test(pass)) score++
  if (/[^A-Za-z0-9]/.test(pass)) score++
  return score
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1"
    >
      <ArrowLeft size={12} /> {label}
    </button>
  )
}

export default function ImageHide() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(1)
  const [operation, setOperation] = useState<Operation>('image')

  const [carrier, setCarrier] = useState<File | null>(null)
  const [carrierPreview, setCarrierPreview] = useState<string | null>(null)
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

  // Each URL revokes only when its own state changes
  useEffect(() => {
    if (!carrierPreview) return
    return () => URL.revokeObjectURL(carrierPreview)
  }, [carrierPreview])

  useEffect(() => {
    if (results.length === 0) return
    return () => results.forEach((r) => URL.revokeObjectURL(r.url))
  }, [results])

  const clearCarrier = () => {
    setCarrier(null)
    setCarrierPreview(null)
    setCapacity(0)
  }

  const handleCarrierUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return
    }
    setError(null)
    setLoaderTitle('Analyzing Carrier...')
    setLoaderSubtitle('Checking file capacity & format')
    setCarrier(file)
    setCarrierPreview(URL.createObjectURL(file))
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('cover', file)
      const res = await api.post('/stego/capacity', formData)
      setCapacity(res.data.max_payload_bytes)
      setStep(3)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to analyze capacity'))
      clearCarrier()
    } finally {
      setLoading(false)
    }
  }

  const handleEmbed = async () => {
    if (!carrier) return
    setError(null)
    setLoaderTitle(usePassword ? 'Encrypting & Hiding...' : 'Hiding Secret...')
    setLoaderSubtitle(
      usePassword
        ? 'AES-256 encrypting payload, then embedding into pixels'
        : 'Embedding payload into carrier pixels',
    )
    setLoading(true)

    // Track URLs so we can revoke them if the request fails midway
    const createdUrls: string[] = []

    try {
      const makeRequest = async (withPassword: boolean): Promise<EmbedResult> => {
        const formData = new FormData()
        formData.append('cover', carrier)
        if (payloadType === 'text') formData.append('secret', secretText)
        else if (secretImage) formData.append('secret_image', secretImage)
        if (withPassword) formData.append('password', password)

        const res = await api.post('/stego/hide', formData, { responseType: 'blob' })
        const url = URL.createObjectURL(new Blob([res.data], { type: 'image/png' }))
        createdUrls.push(url)
        return {
          url,
          name: withPassword ? `secure_${carrier.name}` : `raw_${carrier.name}`,
          isEncrypted: withPassword,
        }
      }

      const newResults = usePassword
        ? await Promise.all([makeRequest(true), makeRequest(false)])
        : [await makeRequest(false)]

      setResults(newResults)
      setStep(5)
    } catch (err) {
      createdUrls.forEach(URL.revokeObjectURL)
      setError(getApiErrorMessage(err, 'Embedding failed.'))
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setStep(1)
    setOperation('image')
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

  const isPayloadValid =
    payloadType === 'text' ? secretText.trim().length > 0 : secretImage !== null
  const isCapacityOk = payloadBytes > 0 && payloadBytes <= capacity
  const isPasswordValid =
    !usePassword || (password.length >= 8 && password === confirmPassword)
  const canEmbed = isPayloadValid && isCapacityOk && isPasswordValid && !loading

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 selection:bg-emerald-500 selection:text-black">
      <Loader show={loading} title={loaderTitle} subtitle={loaderSubtitle} />

      {/* HERO */}
      <div className="rounded-2xl bg-[#131920] border border-slate-800 p-6 md:p-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
              Hide Secret
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Hide Your Secret. <span className="text-[#10B981]">Keep It Invisible.</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Hide private data inside ordinary media files.</p>
        </div>
        <Shield size={48} className="text-emerald-500/20 hidden md:block" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* STEPS INDICATOR */}
      <div className="flex bg-[#131920] border border-slate-800 rounded-2xl p-2">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex-1 flex items-center">
            <button
              type="button"
              onClick={() => { if (s.num < step) setStep(s.num) }}
              disabled={s.num >= step}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl w-full text-left transition-all ${
                step === s.num
                  ? 'bg-[#0B0F14] border border-slate-700'
                  : s.num < step
                  ? 'hover:bg-[#0B0F14] cursor-pointer'
                  : 'cursor-not-allowed'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step > s.num
                    ? 'bg-[#10B981] text-black'
                    : step === s.num
                    ? 'bg-[#10B981]/20 text-[#10B981]'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step > s.num ? <CheckCircle2 size={12} /> : s.num}
              </div>
              <span
                className={`text-xs font-bold ${
                  step >= s.num ? 'text-white' : 'text-slate-500'
                } hidden sm:block`}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && <div className="w-full h-px bg-slate-800 mx-2" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1 */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="text-lg font-bold text-white">Choose Your Operation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {OPERATIONS.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  disabled={!op.active}
                  onClick={() => {
                    if (op.id === 'audio') return navigate('/stego/audio')
                    setOperation(op.id)
                    setStep(2)
                  }}
                  className={`p-5 rounded-2xl border text-left relative transition-all flex flex-col justify-between h-[140px] ${
                    !op.active
                      ? 'opacity-40 cursor-not-allowed bg-[#0B0F14] border-slate-800'
                      : operation === op.id
                      ? 'bg-[#131920] border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-[#131920] border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white">
                    <op.icon size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{op.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{op.desc}</p>
                  </div>
                  {!op.active && (
                    <span className="absolute top-4 right-4 text-[8px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      SOON
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Upload Carrier File</h2>
              <BackButton onClick={() => setStep(1)} label="Back to Operation" />
            </div>

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
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleCarrierUpload(file)
                  }}
                />
                <Upload size={32} className="text-[#10B981] mb-3" />
                <p className="text-sm font-bold text-white">Drag & Drop your file here</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse (Max 25MB)</p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#131920] border border-[#10B981]/50 flex items-center gap-4">
                <img
                  src={carrierPreview!}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                  alt="preview"
                />
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
                  aria-label="Remove carrier"
                  className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Add Secret Payload</h2>
              <BackButton onClick={() => setStep(2)} label="Back to Carrier" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Payload */}
              <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3">
                <div className="flex gap-2 p-1 bg-[#0B0F14] border border-slate-800 rounded-lg">
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
                      rows={4}
                      value={secretText}
                      onChange={(e) => setSecretText(e.target.value)}
                      placeholder="Type your secret message..."
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
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setSecretImage(file)
                        }}
                      />
                      <ImageIcon size={20} className="mx-auto text-slate-500 mb-2" />
                      <p className="text-xs font-bold text-white">
                        {secretImage ? secretImage.name : 'Upload Secret Image'}
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
                    <p className={`text-[10px] font-bold ${STRENGTH_TEXT[strength]}`}>
                      {STRENGTH_LABELS[strength]}
                    </p>
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
              onClick={() => setStep(4)}
              disabled={!canEmbed}
              className="w-full py-3 rounded-xl bg-[#10B981] text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue to Review <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Review & Embed</h2>
              <BackButton onClick={() => setStep(3)} label="Back to Payload" />
            </div>

            <div className="rounded-2xl bg-[#131920] border border-slate-800 p-5 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Operation</span>
                <span className="text-white font-bold capitalize">{operation} Hide</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Carrier</span>
                <span className="text-white font-mono">{carrier?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Payload</span>
                <span className="text-white font-bold capitalize">{payloadType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Encryption</span>
                <span className={usePassword ? 'text-[#10B981] font-bold' : 'text-amber-500 font-bold'}>
                  {usePassword ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEmbed}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#10B981] text-black font-extrabold text-base hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  {usePassword ? 'ENCRYPT & HIDE SECRET' : 'HIDE SECRET'}
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle2 size={48} className="text-[#10B981] mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white">Secret Embedded Successfully</h2>
              <p className="text-xs text-slate-400">Your file is ready.</p>
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
                    <Download size={12} /> DOWNLOAD
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