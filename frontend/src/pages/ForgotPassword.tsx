// src/pages/ForgotPassword.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  Mail,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Send,
} from 'lucide-react'

type Stage = 'form' | 'sending' | 'sent'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState<Stage>('form')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setStage('sending')

    // Backend endpoint not implemented yet — simulate network delay.
    // When backend /auth/forgot-password is added, replace this block
    // with: await api.post('/auth/forgot-password', { email })
    await new Promise((r) => setTimeout(r, 1200))

    setStage('sent')
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
              Locked Out?
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-cyan">
                We'll Get You Back In.
              </span>
            </h2>
            <p className="text-sm text-white/85 leading-relaxed">
              Provide your account email and we'll send a secure reset link. Your
              vault remains encrypted and untouched during recovery.
            </p>
          </div>

          <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
            © {new Date().getFullYear()} StegaVault · Secure Platform
          </div>
        </div>
      </div>

      {/* ============ RIGHT — FORM ============ */}
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
            {/* ─── STAGE: FORM ─── */}
            {stage === 'form' && (
              <>
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-5">
                    <Mail size={22} />
                  </div>
                  <h1 className="font-heading text-3xl font-extrabold text-white mb-2">
                    Forgot password?
                  </h1>
                  <p className="text-sm text-muted-bright">
                    Enter the email address associated with your account and
                    we'll send you a reset link.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-2.5">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono text-muted-bright uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        autoFocus
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-bg-deep/60 border border-border text-white placeholder-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all font-mono text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-bg-deep font-bold hover:bg-primary-dark transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer group"
                  >
                    Send Reset Link
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                </form>
              </>
            )}

            {/* ─── STAGE: SENDING ─── */}
            {stage === 'sending' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-6">
                  <Send size={26} className="animate-pulse" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">
                  Sending reset link...
                </h2>
                <p className="text-sm text-muted-bright">
                  Please wait while we process your request.
                </p>
                <div className="mt-6 h-1 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse w-2/3 rounded-full" />
                </div>
              </div>
            )}

            {/* ─── STAGE: SENT ─── */}
            {stage === 'sent' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">
                  Check your inbox
                </h2>
                <p className="text-sm text-muted-bright mb-6">
                  If an account exists for{' '}
                  <span className="text-primary font-mono">{email}</span>,
                  you'll receive a password reset link shortly.
                </p>

                <div className="p-4 rounded-xl bg-bg-deep/60 border border-border text-xs text-muted-bright leading-relaxed text-left">
                  <p className="font-mono text-primary mb-1 text-[10px] uppercase tracking-widest">
                    Didn't receive it?
                  </p>
                  <ul className="space-y-1 mt-2">
                    <li>• Check your spam / promotions folder</li>
                    <li>• Verify the email address is correct</li>
                    <li>• Wait a few minutes and try again</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setStage('form')
                    setError(null)
                  }}
                  className="mt-6 text-sm text-primary hover:text-primary-glow font-semibold transition-colors cursor-pointer"
                >
                  Try a different email
                </button>
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
            Secure password recovery · AES-256
          </p>
        </div>
      </div>
    </div>
  )
}
