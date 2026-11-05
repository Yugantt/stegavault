import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings as SettingsIcon, User, Lock, Eye, EyeOff,
  Bell, Shield, KeyRound, CheckCircle2, AlertCircle,
  Save, RefreshCw, Trash2, Palette, Globe, Fingerprint,
  Mail, UserCircle, AlertTriangle, Check
} from 'lucide-react'
import { api, getApiErrorMessage } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import Loader from '../components/Loader'

type Tab = 'profile' | 'security' | 'preferences' | 'danger'

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [activeTab, setActiveTab] = useState<Tab>('profile')

  // Profile state
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState((user as any)?.email || '')

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  // Preferences state
  const [notifications, setNotifications] = useState(true)
  const [autoDownload, setAutoDownload] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Danger state
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [loaderTitle, setLoaderTitle] = useState('Saving...')
  const [loaderSubtitle, setLoaderSubtitle] = useState('Updating your settings')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Auto-clear messages
  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [success, error])

  // Password strength
  const getStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++
    if (/\d/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }
  const strength = getStrength(newPassword)
  const strengthLabels = ['Weak', 'Weak', 'Medium', 'Strong', 'Very Strong']
  const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400']

  // Handlers
  const handleProfileSave = async () => {
    if (!username.trim()) return setError('Username cannot be empty.')
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError('Please enter a valid email address.')

    setError(null)
    setLoaderTitle('Saving Profile...')
    setLoaderSubtitle('Updating your account information')
    setLoading(true)
    try {
      const res = await api.patch('/auth/profile', { username, email })
      if (res.data?.user && setUser) setUser(res.data.user)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update profile.'))
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword) return setError('Please enter your current password.')
    if (newPassword.length < 8) return setError('New password must be at least 8 characters.')
    if (newPassword !== confirmPassword) return setError('Passwords do not match.')
    if (currentPassword === newPassword)
      return setError('New password must be different from current.')

    setError(null)
    setLoaderTitle('Updating Password...')
    setLoaderSubtitle('Re-encrypting your account credentials')
    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setSuccess('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to change password.'))
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSave = async () => {
    setError(null)
    setLoaderTitle('Saving Preferences...')
    setLoaderSubtitle('Storing your UI settings')
    setLoading(true)
    try {
      // Local storage save (no backend needed)
      localStorage.setItem(
        'preferences',
        JSON.stringify({ notifications, autoDownload, reducedMotion })
      )
      setSuccess('Preferences saved.')
    } catch (err) {
      setError('Failed to save preferences.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      return setError('Please type DELETE to confirm account deletion.')
    }
    setError(null)
    setLoaderTitle('Deleting Account...')
    setLoaderSubtitle('This action cannot be undone')
    setLoading(true)
    try {
      await api.delete('/auth/account')
      // Clear local storage, logout, redirect
      localStorage.clear()
      window.location.href = '/'
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete account.'))
    } finally {
      setLoading(false)
    }
  }

  // Load preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferences')
    if (saved) {
      try {
        const p = JSON.parse(saved)
        setNotifications(p.notifications ?? true)
        setAutoDownload(p.autoDownload ?? false)
        setReducedMotion(p.reducedMotion ?? false)
      } catch {}
    }
  }, [])

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ]

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 selection:bg-emerald-500 selection:text-black">

      {/* Loader */}
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
          <p className="text-slate-400 text-sm mt-1">
            Control your profile, security, and experience.
          </p>
        </div>
        <SettingsIcon size={48} className="text-emerald-500/20 hidden md:block" />
      </div>

      {/* Toast messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2"
          >
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-[220px_1fr] gap-4">

        {/* SIDEBAR TABS */}
        <div className="rounded-2xl bg-[#131920] border border-slate-800 p-2 h-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
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

                {/* Avatar */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0B0F14] border border-slate-800">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#10B981] text-xl font-bold">
                    {(username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{username || 'User'}</p>
                    <p className="text-xs text-slate-400">{email || 'No email set'}</p>
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#10B981] outline-none"
                    placeholder="Your username"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:border-[#10B981] outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
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
                  <p className="text-xs text-slate-400 mt-1">
                    Use a strong password to protect your account.
                  </p>
                
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#10B981] outline-none"
                      placeholder="Enter current password"
                    />
                    <button
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#10B981] outline-none"
                    placeholder="At least 8 characters"
                  />
                  {newPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="flex gap-1 h-1 rounded-full overflow-hidden">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 ${
                              i < strength ? strengthColors[strength] : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-[10px] font-bold ${strengthColors[strength].replace(
                          'bg-',
                          'text-'
                        )}`}
                      >
                        {strengthLabels[strength]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Confirm New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#10B981] outline-none"
                    placeholder="Re-type new password"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[10px] text-red-400">Passwords do not match.</p>
                  )}
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg bg-[#10B981] text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2"
                >
                  <KeyRound size={14} /> Update Password
                </button>

                {/* Session info */}
                <div className="p-4 rounded-xl bg-[#0B0F14] border border-slate-800 flex items-start gap-3">
                  <Fingerprint size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Account Security</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Your account is protected with AES-256 encryption. Sessions auto-expire after
                      24 hours.
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
                  <p className="text-xs text-slate-400 mt-1">
                    Customize your experience.
                  </p>
                </div>

                {/* Toggle rows */}
                {[
                  {
                    label: 'Notifications',
                    desc: 'Get alerts for operation completion.',
                    value: notifications,
                    setter: setNotifications,
                    icon: Bell,
                  },
                  {
                    label: 'Auto-Download',
                    desc: 'Auto-download files after processing.',
                    value: autoDownload,
                    setter: setAutoDownload,
                    icon: Globe,
                  },
                  {
                    label: 'Reduced Motion',
                    desc: 'Minimize animations for accessibility.',
                    value: reducedMotion,
                    setter: setReducedMotion,
                    icon: Shield,
                  },
                ].map((pref, i) => (
                  <div
                    key={i}
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
                      onClick={() => pref.setter(!pref.value)}
                      className={`w-9 h-5 rounded-full relative transition-colors ${
                        pref.value ? 'bg-[#10B981]' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          pref.value ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <button
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
                  <p className="text-xs text-slate-400 mt-1">
                    Irreversible actions — proceed with caution.
                  </p>
                
                </div>

                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/30 space-y-3">
                  <div>
                    <p className="text-sm font-bold text-white">Delete Account</p>
                    <p className="text-xs text-slate-400 mt-1">
                      This will permanently delete your account, all history, and every stored secret.
                      This action cannot be undone.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">
                      Type <span className="font-mono text-red-400">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-red-500/30 rounded-lg px-3 py-2.5 text-sm text-white focus:border-red-500 outline-none"
                      placeholder="DELETE"
                    />
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading || deleteConfirm !== "DELETE"}
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


