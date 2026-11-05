// src/pages/Register.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

function passwordStrength(pwd: string): {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
} {
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  const capped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['text-danger', 'text-danger', 'text-warning', 'text-primary', 'text-primary']
  return { score: capped, label: labels[capped], color: colors[capped] }
}

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const isSubmitting = useAuthStore((s) => s.isSubmitting)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const strength = passwordStrength(password)
  const passwordsMatch = password && password === confirmPassword

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setLocalError(null)

    if (!username.trim() || !email.trim() || !password) {
      setLocalError('Please fill in all required fields.')
      return
    }
    if (username.length < 3) {
      setLocalError('Username must be at least 3 characters.')
      return
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }
    if (!termsAccepted) {
      setLocalError('Please accept the Terms of Service to continue.')
      return
    }

    const success = await register({
      email: email.trim(),
      username: username.trim(),
      password,
    })
    if (success) {
      navigate('/dashboard', { replace: true })
    }
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
              Start Hiding.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-cyan">
                Start Protecting.
              </span>
            </h2>
            <p className="text-sm text-white/85 leading-relaxed">
              Create your encrypted vault in seconds. Your secrets stay hidden
              inside ordinary images, protected by military-grade cryptography.
            </p>

            <ul className="mt-8 space-y-3 text-sm">
              {[
                'AES-256-GCM authenticated encryption',
                'Argon2id password-based key derivation',
                'Zero visual trace in carrier images',
                'Full operation history & audit trail',
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-white/85"
                >
                  <CheckCircle2
                    size={16}
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
            © {new Date().getFullYear()} StegaVault · Secure Platform
          </div>
        </div>
      </div>

      {/* ============ RIGHT — FORM ============ */}
      <div className="relative flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="absolute inset-0 lg:hidden">
          <img
            src="/mountain.jpg"
            alt=""
            className="w-full h-full object-cover opacity-30"
            aria-hidden
          />
          <div className="absolute inset-0 bg-bg-deep/80" />
        </div>

        <div className="relative w-full max-w-md py-8">
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
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-extrabold text-white mb-2">
                Create account
              </h1>
              <p className="text-sm text-muted-bright">
                Join StegaVault and start hiding secrets today.
              </p>
            </div>

            {(error || localError) && (
              <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-2.5">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error || localError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-mono text-muted-bright uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <UserIcon
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                  />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    autoComplete="username"
                    minLength={3}
                    maxLength={50}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-bg-deep/60 border border-border text-white placeholder-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all font-mono text-sm"
                  />
                </div>
              </div>

              {/* Email */}
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
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-bg-deep/60 border border-border text-white placeholder-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all font-mono text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-mono text-muted-bright uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-bg-deep/60 border border-border text-white placeholder-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-white transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength bar */}
                {password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < strength.score
                              ? strength.score === 1
                                ? 'bg-danger'
                                : strength.score === 2
                                ? 'bg-warning'
                                : 'bg-primary'
                              : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[10px] font-mono uppercase tracking-wider ${strength.color}`}>
                      Strength: {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-mono text-muted-bright uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={`w-full pl-11 pr-12 py-3 rounded-xl bg-bg-deep/60 border text-white placeholder-muted/50 focus:outline-none focus:ring-2 transition-all font-mono text-sm ${
                      confirmPassword
                        ? passwordsMatch
                          ? 'border-primary focus:border-primary focus:ring-primary/30'
                          : 'border-danger focus:border-danger focus:ring-danger/30'
                        : 'border-border focus:border-primary focus:ring-primary/30'
                    }`}
                  />
                  {confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? (
                        <CheckCircle2 size={16} className="text-primary" />
                      ) : (
                        <XCircle size={16} className="text-danger" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 text-xs text-muted-bright cursor-pointer select-none pt-2">
                <span
                  className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                    termsAccepted
                      ? 'bg-primary border-primary'
                      : 'bg-bg-deep border-border'
                  }`}
                >
                  {termsAccepted && (
                    <CheckCircle2 size={12} className="text-bg-deep" />
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="sr-only"
                />
                <span>
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-bg-deep font-bold hover:bg-primary-dark transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-bg-deep/40 border-t-bg-deep rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
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
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary-glow font-semibold transition-colors"
              >
                Sign in
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
