// src/pages/TwoFactor.tsx
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent, ClipboardEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Smartphone,
  Key,
} from 'lucide-react'

const OTP_LENGTH = 6
const BACKUP_CODE_COUNT = 10

type Step = 'setup' | 'verify' | 'backup'

// Deterministic pseudo-QR grid (21x21) — layout only, not scannable
const QR_GRID = (() => {
  const SIZE = 21
  let seed = 48271
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  const grid: boolean[][] = []
  for (let y = 0; y < SIZE; y++) {
    const row: boolean[] = []
    for (let x = 0; x < SIZE; x++) {
      row.push(rand() > 0.5)
    }
    grid.push(row)
  }
  // Add corner position markers (QR-style)
  const addMarker = (cx: number, cy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = y === 0 || y === 6 || x === 0 || x === 6
        const center = x >= 2 && x <= 4 && y >= 2 && y <= 4
        grid[cy + y][cx + x] = edge || center
      }
    }
  }
  addMarker(0, 0)
  addMarker(SIZE - 7, 0)
  addMarker(0, SIZE - 7)
  return grid
})()

function BackupCodes(): string[] {
  const codes: string[] = []
  let seed = 5150
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    let code = ''
    for (let j = 0; j < 8; j++) {
      if (j === 4) code += '-'
      code += ALPHABET[Math.floor(rand() * ALPHABET.length)]
    }
    codes.push(code)
  }
  return codes
}

export default function TwoFactor() {
  const [step, setStep] = useState<Step>('setup')
  const [secretCopied, setSecretCopied] = useState(false)
  const [backupCopied, setBackupCopied] = useState(false)
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // Static values (deterministic)
  const secretKey = 'JBSW Y3DP EHPK 3PXP'
  const backupCodes = useRef(BackupCodes()).current

  const code = digits.join('')

  useEffect(() => {
    if (step === 'verify') {
      inputRefs.current[0]?.focus()
    }
  }, [step])

  // Auto-submit when code complete
  useEffect(() => {
    if (code.length === OTP_LENGTH && step === 'verify' && !verifying) {
      const run = async () => {
        setError(null)
        setVerifying(true)
        await new Promise((r) => setTimeout(r, 1400))
        setVerifying(false)
        setStep('backup')
      }
      run()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, step])

  const handleChange = (idx: number, value: string) => {
    const clean = value.replace(/\D/g, '')
    if (!clean) {
      const next = [...digits]
      next[idx] = ''
      setDigits(next)
      return
    }
    const next = [...digits]
    const chars = clean.split('').slice(0, OTP_LENGTH - idx)
    chars.forEach((c, i) => {
      next[idx + i] = c
    })
    setDigits(next)
    const nextFocus = Math.min(idx + chars.length, OTP_LENGTH - 1)
    inputRefs.current[nextFocus]?.focus()
  }

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = [...digits]
      if (next[idx]) {
        next[idx] = ''
        setDigits(next)
      } else if (idx > 0) {
        next[idx - 1] = ''
        setDigits(next)
        inputRefs.current[idx - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!text) return
    const next = Array(OTP_LENGTH).fill('')
    text
      .slice(0, OTP_LENGTH)
      .split('')
      .forEach((c, i) => {
        next[i] = c
      })
    setDigits(next)
    const lastFilled = Math.min(text.length, OTP_LENGTH) - 1
    inputRefs.current[Math.max(0, lastFilled)]?.focus()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (code.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits.')
    }
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey.replace(/\s/g, ''))
    setSecretCopied(true)
    setTimeout(() => setSecretCopied(false), 2000)
  }

  const handleCopyBackup = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    setBackupCopied(true)
    setTimeout(() => setBackupCopied(false), 2000)
  }

  const handleDownloadBackup = () => {
    const content = `StegaVault 3.0 — Two-Factor Backup Codes\nGenerated: ${new Date().toISOString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe. Each code can only be used once.\nIf you lose access to your authenticator app, use one of these codes to sign in.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stegavault-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg-deep">
      {/* ============ LEFT — CINEMATIC ============ */}
      <div className="relative hidden lg:block overflow-hidden">
        <img
          src="/mountain.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-bg-deep/95 via-bg-deep/75 to-bg-deep/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/20 to-transparent" />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(16,185,129,0.18), transparent 60%)',
          }}
        />

        <div className="relative h-full flex flex-col justify-between p-12 z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Shield size={20} />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-white">
              Stega<span className="text-primary">Vault</span>
            </span>
          </Link>

          <div className="max-w-md">
            <h2 className="font-heading text-4xl font-extrabold text-white leading-tight mb-4 drop-shadow-2xl">
              Two-Factor
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-cyan">
                Authenticator Setup.
              </span>
            </h2>
            <p className="text-sm text-white/85 leading-relaxed">
              Add an extra layer of security with a TOTP authenticator app. Even
              if your password is compromised, your vault stays locked.
            </p>
          </div>

          <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
            © {new Date().getFullYear()} StegaVault · Secure Platform
          </div>
        </div>
      </div>

      {/* ============ RIGHT — 2FA FLOW ============ */}
      <div className="relative flex items-center justify-center p-6 lg:p-12">
        <div className="absolute inset-0 lg:hidden">
          <img
            src="/mountain.jpg"
            alt=""
            className="w-full h-full object-cover opacity-30"
            aria-hidden
          />
          <div className="absolute inset-0 bg-bg-deep/80" />
        </div>

        <div className="relative w-full max-w-md">
          <Link
            to="/"
            className="lg:hidden flex items-center justify-center gap-2.5 mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center text-primary">
              <Shield size={20} />
            </div>
            <span className="font-heading font-extrabold text-xl text-white">
              Stega<span className="text-primary">Vault</span>
            </span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-5">
            {(['setup', 'verify', 'backup'] as Step[]).map((s, i) => {
              const labels = ['Setup', 'Verify', 'Backup']
              const active = step === s
              const done = ['setup', 'verify', 'backup'].indexOf(step) > i
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      active
                        ? 'bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        : done
                        ? 'bg-primary/50'
                        : 'bg-border'
                    }`}
                    title={labels[i]}
                  />
                </div>
              )
            })}
          </div>

          <div className="glass rounded-2xl p-8 md:p-10 shadow-2xl border border-glass-border">
            {/* ─── STEP: SETUP ─── */}
            {step === 'setup' && (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple mb-5">
                    <Smartphone size={22} />
                  </div>
                  <h1 className="font-heading text-2xl font-extrabold text-white mb-2">
                    Set up authenticator
                  </h1>
                  <p className="text-sm text-muted-bright">
                    Scan the QR code with Google Authenticator, Authy, or any
                    TOTP-compatible app.
                  </p>
                </div>

                {/* QR code (procedural) */}
                <div className="flex justify-center my-6">
                  <div className="p-4 rounded-2xl bg-white">
                    <svg
                      width={168}
                      height={168}
                      viewBox="0 0 21 21"
                      style={{ imageRendering: 'pixelated' }}
                    >
                      {QR_GRID.map((row, y) =>
                        row.map((filled, x) =>
                          filled ? (
                            <rect
                              key={`${x}-${y}`}
                              x={x}
                              y={y}
                              width={1}
                              height={1}
                              fill="#0a0e27"
                            />
                          ) : null,
                        ),
                      )}
                    </svg>
                  </div>
                </div>

                {/* Manual key */}
                <div>
                  <label className="block text-xs font-mono text-muted-bright uppercase tracking-wider mb-2">
                    Or enter key manually
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-bg-deep/60 border border-border">
                    <Key size={16} className="text-primary shrink-0" />
                    <span className="flex-1 font-mono text-sm text-white tracking-wider">
                      {secretKey}
                    </span>
                    <button
                      onClick={handleCopySecret}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title="Copy key"
                    >
                      {secretCopied ? (
                        <Check size={14} className="text-primary" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setStep('verify')}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-bg-deep font-bold hover:bg-primary-dark transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer group"
                >
                  I have scanned it
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </>
            )}

            {/* ─── STEP: VERIFY ─── */}
            {step === 'verify' && (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan mb-5">
                    <Shield size={22} />
                  </div>
                  <h1 className="font-heading text-2xl font-extrabold text-white mb-2">
                    Verify code
                  </h1>
                  <p className="text-sm text-muted-bright">
                    Enter the 6-digit code displayed in your authenticator app.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-2.5">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div
                    className="flex justify-between gap-2"
                    onPaste={handlePaste}
                  >
                    {digits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputRefs.current[i] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        disabled={verifying}
                        className={`w-full aspect-square max-w-[56px] rounded-xl bg-bg-deep/60 border-2 text-center text-2xl font-mono font-bold text-white focus:outline-none transition-all disabled:opacity-50 ${
                          digit
                            ? 'border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : 'border-border focus:border-primary focus:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={verifying || code.length !== OTP_LENGTH}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-bg-deep font-bold hover:bg-primary-dark transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {verifying ? (
                      <>
                        <span className="w-4 h-4 border-2 border-bg-deep/40 border-t-bg-deep rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ─── STEP: BACKUP CODES ─── */}
            {step === 'backup' && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary mb-5 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 size={32} />
                  </div>
                  <h1 className="font-heading text-2xl font-extrabold text-white mb-2">
                    2FA Activated
                  </h1>
                  <p className="text-sm text-muted-bright">
                    Save these backup codes. Each code works only once. Store
                    them somewhere safe and offline.
                  </p>
                </div>

                {/* Backup codes grid */}
                <div className="p-4 rounded-xl bg-bg-deep/60 border border-border">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-sm text-white">
                    {backupCodes.map((c) => (
                      <div key={c} className="text-center tracking-wider">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyBackup}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border text-white text-sm font-semibold hover:border-primary/40 transition-all cursor-pointer"
                  >
                    {backupCopied ? (
                      <>
                        <Check size={14} className="text-primary" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadBackup}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border text-white text-sm font-semibold hover:border-primary/40 transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>

                <Link
                  to="/dashboard"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-bg-deep font-bold hover:bg-primary-dark transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer group"
                >
                  Continue to Dashboard
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
              </>
            )}

            {/* ─── BACK ─── */}
            <div className="mt-7 pt-6 border-t border-border flex items-center justify-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-bright hover:text-white transition-colors"
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] font-mono text-muted uppercase tracking-widest">
            Two-Factor Authentication · TOTP
          </p>
        </div>
      </div>
    </div>
  )
}
