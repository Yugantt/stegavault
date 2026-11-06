import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings as SettingsIcon, User, Lock, Eye, EyeOff,
  Bell, Shield, KeyRound, CheckCircle2, AlertCircle,
  Save, Trash2, Palette, Globe, Fingerprint,
  Mail, UserCircle, AlertTriangle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { api, getApiErrorMessage } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import Loader from '../components/Loader'

type Tab = 'profile' | 'security' | 'preferences' | 'danger'
type Notice = { kind: 'success' | 'error'; text: string } | null

type StoredPrefs = Partial<{
  notifications: boolean
  autoDownload: boolean
  reducedMotion: boolean
}>

type UserWithContact = { username?: string; email?: string }

const PREFS_KEY = 'preferences'

const STRENGTH_LABELS = ['Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'] as const
const STRENGTH_BG = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400'] as const
const STRENGTH_TEXT = ['text-red-500', 'text-red-500', 'text-amber-500', 'text-emerald-500', 'text-emerald-400'] as const

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

function getStrength(pass: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0
  if (pass.length >= 8) score++
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++
  if (/\d/.test(pass)) score++
  if (/[^A-Za-z0-9]/.test(pass)) score++
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function readStoredPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as StoredPrefs) : {}
  } catch {
    return {}
  }
}

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const contact = (user ?? {}) as UserWithContact
  const usernameFromStore = contact.username ?? ''
  const emailFromStore = contact.email ?? ''

  const [username, setUsername] = useState(usernameFromStore)
  const [email, setEmail] = useState(emailFromStore)

  // Adjust state during render when the store value changes (React-recommended
  // alternative to a setState-in-effect sync).
  const userKey = `${usernameFromStore}|${emailFromStore}`
  const [prevUserKey, setPrevUserKey] = useState(userKey)
  if (userKey !== prevUserKey) {
    setPrevUserKey(userKey)
    setUsername(usernameFromStore)
    setEmail(emailFromStore)
  }

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  // Lazy initializers — no effect needed.
  const [notifications, setNotifications] = useState(() => readStoredPrefs().notifications ?? true)
  const [autoDownload, setAutoDownload] = useState(() => readStoredPrefs().autoDownload ?? false)
  const [reducedMotion, setReducedMotion] = useState(() => readStoredPrefs().reducedMotion ?? false)

  const [deleteConfirm, setDeleteConfirm] = useState('')

  const [loading, setLoading] = useState(false)
  const [loaderTitle, setLoaderTitle] = useState('Saving...')
  const [loaderSubtitle, setLoaderSubtitle] = useState('Updating your settings')
  const [notice, setNotice] = useState<Notice>(null)

  // Auto-clear notice (setState inside a timer callback is explicitly allowed).
  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(null), 4000)
    return () => window.clearTimeout(t)
  }, [notice])

  const strength = getStrength(newPassword)

  const handleProfileSave = async () => {
    if (!username.trim()) return setNotice({ kind: 'error', text: 'Username cannot be empty.' })
    if (email && !isValidEmail(email)) return setNotice({ kind: 'error', text: 'Please enter a valid email address.' })

    setNotice(null)
    setLoaderTitle('Saving Profile...')
    setLoaderSubtitle('Updating your account information')
    setLoading(true)
    try {
      const res = await api.patch('/auth/profile', { username, email })
      if (res.data?.user) setUser(res.data.user)
      setNotice({ kind: 'success', text: 'Profile updated successfully.' })
    } catch (err) {
      setNotice({ kind: 'error', text: getApiErrorMessage(err, 'Failed to update profile.') })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword) return setNotice({ kind: 'error', text: 'Please enter your current password.' })
    if (newPassword.length < 8) return setNotice({ kind: 'error', text: 'New password must be at least 8 characters.' })
    if (newPassword !== confirmPassword) return setNotice({ kind: 'error', text: 'Passwords do not match.' })
    if (currentPassword === newPassword) return setNotice({ kind: 'error', text: 'New password must be different from current.' })

    setNotice(null)
    setLoaderTitle('Updating Password...')
    setLoaderSubtitle('Re-encrypting your account credentials')
    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setNotice({ kind: 'success', text: 'Password changed successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setNotice({ kind: 'error', text: getApiErrorMessage(err, 'Failed to change password.') })
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSave = async () => {
    setNotice(null)
    setLoaderTitle('Saving Preferences...')
    setLoaderSubtitle('Storing your UI settings')
    setLoading(true)
    try {
      const prefs: StoredPrefs = { notifications, autoDownload, reducedMotion }
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
      setNotice({ kind: 'success', text: 'Preferences saved.' })
    } catch {
      setNotice({ kind: 'error', text: 'Failed to save preferences.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return setNotice({ kind: 'error', text: 'Please type DELETE to confirm account deletion.' })

    setNotice(null)
    setLoaderTitle('Deleting Account...')
    setLoaderSubtitle('This action cannot be undone')
    setLoading(true)
    try {
      await api.delete('/auth/account')
      localStorage.clear()
      window.location.href = '/'
    } catch (err) {
      setNotice({ kind: 'error', text: getApiErrorMessage(err, 'Failed to delete account.') })
      setLoading(false)
    }
  }

  const PREF_ROWS = [
    { label: 'Notifications', desc: 'Get alerts for operation completion.', value: notifications, setter: setNotifications, icon: Bell },
    { label: 'Auto-Download', desc: 'Auto-download files after processing.', value: autoDownload, setter: setAutoDownload, icon: Globe },
    { label: 'Reduced Motion', desc: 'Minimize animations for accessibility.', value: reducedMotion, setter: setReducedMotion, icon: Shield },
  ] as const

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 selection:bg-emerald-500 selection:text-black">
      <Loader show={loading} title={loaderTitle} subtitle={loaderSubtitle} />

      {/* HERO */}
      <div className="rounded-2xl bg-[#131920] border border-slate-800 p-6 md:p-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
              Settings
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Manage Your <span className="text-[#10B981]">Account & Preferences.</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Control your profile, security, and experience.</p>
        </div>
        <SettingsIcon size={48} className="text-emerald-500/20 hidden md:block" />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.kind}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
              notice.kind === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {notice.kind === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {notice.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-[220px_1fr] gap-4">
        {/* SIDEBAR TABS */}
        <div className="rounded-2xl bg-[#131920] border border-slate-800 p-2 h-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors mb-1 ${
                activeTab === tab.id
                  ? tab.id === 'danger'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="rounded-2xl bg-[#131920] border border-slate-800 p-6">
          <AnimatePresence mode="wait">

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User size={16} className="text-[#10B981]" /> Profile Information
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Update your account details.</p>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0B0F14] border border-slate-800">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#10B981] text-xl font-bold">
                    {(username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{username || 'User'}</p>
                    <p className="text-xs text-slate-400">{email || 'No email set'}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-username" className="text-xs font-bold text-slate-400">Username</label>
                  <input
                    id="settings-username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#10B981] outline-none"
                    placeholder="Your username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-email" className="text-xs font-bold text-slate-400">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="settings-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:border-[#10B981] outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg bg-[#10B981] text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={14} /> Save Changes
                </button>
              </motion.div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock size={16} className="text-[#10B981]" /> Change Password
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Use a strong password to protect your account.</p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-current-password" className="text-xs font-bold text-slate-400">Current Password</label>
                  <div className="relative">
                    <input
                      id="settings-current-password"
                      name="current-password"
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 pr-10 text-sm text-white focus:border-[#10B981] outline-none"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((v) => !v)}
                      aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-new-password" className="text-xs font-bold text-slate-400">New Password</label>
                  <input
                    id="settings-new-password"
                    name="new-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#10B981] outline-none"
                    placeholder="At least 8 characters"
                  />
                  {newPassword && (
                    <div className="space-y-1 pt-1">
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
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-confirm-password" className="text-xs font-bold text-slate-400">Confirm New Password</label>
                  <input
                    id="settings-confirm-password"
                    name="confirm-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#10B981] outline-none"
                    placeholder="Re-type new password"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[10px] text-red-400">Passwords do not match.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg bg-[#10B981] text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2"
                >
                  <KeyRound size={14} /> Update Password
                </button>

                <div className="p-4 rounded-xl bg-[#0B0F14] border border-slate-800 flex items-start gap-3">
                  <Fingerprint size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Account Security</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Your account is protected with AES-256 encryption. Sessions auto-expire after 24 hours.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Palette size={16} className="text-[#10B981]" /> Preferences
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Customize your experience.</p>
                </div>

                {PREF_ROWS.map((pref) => (
                  <div
                    key={pref.label}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#0B0F14] border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                        <pref.icon size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{pref.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{pref.desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={pref.value}
                      aria-label={pref.label}
                      onClick={() => pref.setter(!pref.value)}
                      className={`w-9 h-5 rounded-full relative transition-colors ${pref.value ? 'bg-[#10B981]' : 'bg-slate-700'}`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform ${
                          pref.value ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handlePreferencesSave}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg bg-[#10B981] text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={14} /> Save Preferences
                </button>
              </motion.div>
            )}

            {/* DANGER TAB */}
            {activeTab === 'danger' && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-base font-bold text-red-400 flex items-center gap-2">
                    <AlertTriangle size={16} /> Danger Zone
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Irreversible actions — proceed with caution.</p>
                </div>

                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/30 space-y-3">
                  <div>
                    <p className="text-sm font-bold text-white">Delete Account</p>
                    <p className="text-xs text-slate-400 mt-1">
                      This will permanently delete your account, all history, and every stored secret. This action cannot be undone.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="settings-delete-confirm" className="text-xs font-bold text-slate-400">
                      Type <span className="font-mono text-red-400">DELETE</span> to confirm
                    </label>
                    <input
                      id="settings-delete-confirm"
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-red-500/30 rounded-lg px-3 py-2.5 text-sm text-white focus:border-red-500 outline-none"
                      placeholder="DELETE"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={loading || deleteConfirm !== 'DELETE'}
                    className="px-4 py-2.5 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Permanently Delete Account
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}