// src/pages/VerifyOTP.tsx
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent, ClipboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Mail,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'

const OTP_LENGTH = 6
const RESEND_SECONDS = 60

export default function VerifyOTP() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [stage, setStage] = useState<'form' | 'verifying' | 'success'>('form')
  const [error, setError] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(RESEND_SECONDS)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const navigate = useNavigate()

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return
    const id = setInterval(() => setResendIn((n) => Math.max(0, n - 1)), 1000)
    return () => clearInterval(id)
  }, [resendIn])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const code = digits.join('')

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

  const verify = async (value: string) => {
    if (value.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits.')
      return
    }
    setError(null)
    setStage('verifying')

    // Backend endpoint /auth/verify-otp not implemented yet.
    // Replace this block when backend is ready:
    // await api.post('/auth/verify-otp', { code: value })
    await new Promise((r) => setTimeout(r, 1400))

    // For demo: any 6-digit code succeeds
    setStage('success')
    setTimeout(() => {
      navigate('/login', { replace: true })
    }, 1600)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    verify(code)
  }

  // Auto-submit on 6th digit
  useEffect(() => {
    if (code.length === OTP_LENGTH && stage === 'form') {
      verify(code)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, stage])

  const handleResend = () => {
    if (resendIn > 0) return
    setResendIn(RESEND_SECONDS)
    setError(null)
    // await api.post('/auth/resend-otp')
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
                Email Verification.
              </span>
            </h2>
            <p className="text-sm text-white/85 leading-relaxed">
              Enter the 6-digit verification code sent to your email. This
              additional layer ensures only you can access your vault.
            </p>
          </div>

          <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
            © {new Date().getFullYear()} StegaVault · Secure Platform
          </div>
        </div>
      </div>

      {/* ============ RIGHT — OTP FORM ============ */}
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

          <div className="glass rounded-2xl p-8 md:p-10 shadow-2xl border border-glass-border">
            {/* ─── FORM ─── */}
            {(stage === 'form' || stage === 'verifying') && (
              <>
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan mb-5">
                    <Mail size={22} />
                  </div>
                  <h1 className="font-heading text-3xl font-extrabold text-white mb-2">
                    Verify your email
                  </h1>
                  <p className="text-sm text-muted-bright">
                    We sent a 6-digit code to your email. Enter it below to
                    continue.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-2.5">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* OTP Boxes */}
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
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        disabled={stage === 'verifying'}
                        className={`w-full aspect-square max-w-[56px] rounded-xl bg-bg-deep/60 border-2 text-center text-2xl font-mono font-bold text-white focus:outline-none transition-all disabled:opacity-50 ${
                          digit
                            ? 'border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : 'border-border focus:border-primary focus:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Resend row */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-bright">
                      {resendIn > 0 ? (
                        <>
                          Resend code in{' '}
                          <span className="text-primary font-mono">
                            {resendIn}s
                          </span>
                        </>
                      ) : (
                        'Didn\'t receive the code?'
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendIn > 0}
                      className={`inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                        resendIn > 0
                          ? 'text-muted cursor-not-allowed'
                          : 'text-primary hover:text-primary-glow'
                      }`}
                    >
                      <RefreshCw
                        size={12}
                        className={resendIn > 0 ? '' : 'animate-spin-once'}
                      />
                      Resend
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={
                      stage === 'verifying' || code.length !== OTP_LENGTH
                    }
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-bg-deep font-bold hover:bg-primary-dark transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
                  >
                    {stage === 'verifying' ? (
                      <>
                        <span className="w-4 h-4 border-2 border-bg-deep/40 border-t-bg-deep rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Code
                        <ArrowRight
                          size={18}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ─── SUCCESS ─── */}
            {stage === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">
                  Verified successfully
                </h2>
                <p className="text-sm text-muted-bright">
                  Redirecting you to sign in...
                </p>
              </div>
            )}

            {/* ─── BACK TO LOGIN ─── */}
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
            Email OTP · 6-digit verification
          </p>
        </div>
      </div>
    </div>
  )
}
