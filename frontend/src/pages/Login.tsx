// src/pages/Login.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield, Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const REMEMBER_KEY = 'sv_remember_email'
const CURRENT_YEAR = new Date().getFullYear()

function BrandLogo({ glow = false }: { glow?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-10 h-10 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center text-primary ${
          glow ? 'shadow-[0_0_20px_rgba(16,185,129,0.4)]' : ''
        }`}
      >
        <Shield size={20} />
      </div>
      <span className="font-heading font-extrabold text-xl tracking-tight text-white">
        Stega<span className="text-primary">Vault</span>
      </span>
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(() => localStorage.getItem(REMEMBER_KEY) !== null)

  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const isSubmitting = useAuthStore((s) => s.isSubmitting)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    const success = await login(email.trim(), password)
    if (success) {
      if (remember) localStorage.setItem(REMEMBER_KEY, email.trim())
      else localStorage.removeItem(REMEMBER_KEY)
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg-deep">
      {/* ============ LEFT — CINEMATIC VISUAL ============ */}
      <div className="relative hidden lg:block overflow-hidden">
        <img
          src="/mountain.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-bg-deep/90 via-bg-deep/50 to-bg-deep/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(16,185,129,0.18), transparent 60%)',
          }}
        />

        <div className="relative h-full flex flex-col justify-between p-12 z-10">
          <Link to="/">
            <BrandLogo glow />
          </Link>

          <div className="max-w-md">
            <h2 className="font-heading text-4xl font-extrabold text-white leading-tight mb-4 drop-shadow-2xl">
              Your Secrets.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-cyan">
                Invisible to the World.
              </span>
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              StegaVault combines AES-256-GCM encryption with least-significant-bit
              steganography to hide confidential messages inside ordinary images.
            </p>

            <div className="mt-8 flex items-center gap-6 text-xs font-mono">
              <div>
                <div className="text-primary font-bold">AES-256</div>
                <div className="text-white/50 uppercase tracking-widest text-[10px] mt-0.5">
                  Encryption
                </div>
              </div>
              <div>
                <div className="text-accent-cyan font-bold">LSB</div>
                <div className="text-white/50 uppercase tracking-widest text-[10px] mt-0.5">
                  Embedding
                </div>
              </div>
              <div>
                <div className="text-white font-bold">Argon2id</div>
                <div className="text-white/50 uppercase tracking-widest text-[10px] mt-0.5">
                  KDF
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
            © {CURRENT_YEAR} StegaVault · Secure Platform
          </div>
        </div>
      </div>

      {/* ============ RIGHT — LOGIN FORM ============ */}
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
          <Link to="/" className="lg:hidden flex items-center justify-center mb-8">
            <BrandLogo />
          </Link>

          <div className="glass rounded-2xl p-8 md:p-10 shadow-2xl border border-glass-border">
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-extrabold text-white mb-2">
                Welcome back
              </h1>
              <p className="text-sm text-muted-bright">
                Sign in to access your encrypted vault.
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
                <label
                  htmlFor="login-email"
                  className="block text-xs font-mono text-muted-bright uppercase tracking-wider mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                  />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-bg-deep/60 border border-border text-white placeholder-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-mono text-muted-bright uppercase tracking-wider mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                  />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-bg-deep/60 border border-border text-white placeholder-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-white transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted-bright cursor-pointer select-none group">
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 group-focus-within:ring-offset-2 group-focus-within:ring-offset-bg-deep ${
                      remember ? 'bg-primary border-primary' : 'bg-bg-deep border-border'
                    }`}
                  >
                    {remember && <CheckCircle2 size={12} className="text-bg-deep" />}
                  </span>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="sr-only"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-primary hover:text-primary-glow transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-bg-deep font-bold hover:bg-primary-dark transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-bg-deep/40 border-t-bg-deep rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest">
                or
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <p className="text-center text-sm text-muted-bright">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary hover:text-primary-glow font-semibold transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-[10px] font-mono text-muted uppercase tracking-widest">
            Protected by AES-256-GCM · Argon2id
          </p>
        </div>
      </div>
    </div>
  )
}