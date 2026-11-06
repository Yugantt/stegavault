import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle, Search, ChevronDown, Mail, MessageSquare,
  FileText, LifeBuoy, BookOpen, Shield, Lock, Send,
  CheckCircle2, AlertCircle, Keyboard, Image as ImageIcon,
  User, Sparkles, Info,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { api } from '../lib/api'
import Loader from '../components/Loader'

interface FAQItem { q: string; a: string }
interface FAQCategory { category: string; icon: LucideIcon; items: FAQItem[] }

type Notice = { kind: 'success' | 'error' | 'info'; text: string } | null

const FAQ_DATA: FAQCategory[] = [
  {
    category: 'Getting Started',
    icon: BookOpen,
    items: [
      { q: 'What is StegaVault?', a: 'StegaVault is a steganography tool that hides secret messages and files inside ordinary images. It uses LSB (Least Significant Bit) embedding plus AES-256 encryption, so the hidden data is invisible to the human eye and locked behind a password of your choice.' },
      { q: 'Do I need an account to use it?', a: 'Yes. An account is required to access the hide and extract features, and to keep a personal operation history. Sign up takes less than a minute.' },
      { q: 'Is StegaVault free?', a: 'Yes, all core features — image hide, image extract, and history — are free forever. Premium features like audio/video hiding and batch operations are on the roadmap.' },
      { q: 'How do I hide my first secret?', a: '1) Go to Hide Secret. 2) Pick "Image Hide". 3) Upload your carrier image (PNG/JPG/BMP). 4) Type your secret text or upload a secret image. 5) Set a password (highly recommended). 6) Click "Encrypt & Hide Secret". 7) Download the stego file.' },
    ],
  },
  {
    category: 'Hiding Files',
    icon: ImageIcon,
    items: [
      { q: 'What file formats are supported?', a: 'Currently: PNG, JPG, and BMP for the carrier image, and PNG/JPG for secret images. Audio (WAV/MP3) and video (MP4/AVI) support is coming soon.' },
      { q: 'How much data can I hide?', a: 'Capacity depends on the carrier image size. A rough rule: 1 MB of image ≈ 0.5 MB of hidden data. StegaVault shows the exact capacity right after you upload the carrier.' },
      { q: 'Will the image look different after hiding?', a: 'No. Steganography only modifies the least significant bits — changes that are imperceptible to the human eye. Side-by-side, the original and the stego look identical.' },
      { q: 'Can I hide text and an image together?', a: 'Not yet. Each operation carries either text OR one image. Combined payloads are on the roadmap for a future release.' },
    ],
  },
  {
    category: 'Extracting Files',
    icon: Search,
    items: [
      { q: 'How do I extract a hidden secret?', a: 'Go to Extract Secret, upload the stego file, turn on the password toggle (if the file was hidden with one), type the password, and click "Extract Hidden Secret". The payload appears instantly.' },
      { q: 'What if I forgot the password?', a: 'Unfortunately, passwords cannot be recovered — that is the whole point of encryption. Without the correct password, the payload remains locked. Always store your passwords in a password manager.' },
      { q: 'Why am I getting an extraction error?', a: 'Common causes: (1) Wrong password. (2) The file was compressed during transfer (e.g., via WhatsApp or Instagram). (3) The file wasn\'t created by StegaVault. (4) Backend version mismatch — try refreshing the page.' },
      { q: 'Can I extract from a WhatsApp-received image?', a: 'No. WhatsApp, Instagram, Telegram, and most messaging apps recompress images, which destroys the LSB data. Always share stego files as "Documents" or via direct download links.' },
    ],
  },
  {
    category: 'Security & Privacy',
    icon: Shield,
    items: [
      { q: 'What encryption is used?', a: 'Payloads are encrypted with AES-256-GCM before being embedded into pixels. This is industry-standard, the same family used by banks and government agencies.' },
      { q: 'Is my data stored on servers?', a: 'No. Your carrier and payload are processed in-memory on the backend, and the response is streamed directly to your browser. We do not persist any file. History metadata (filename, timestamp) is stored — never the content.' },
      { q: 'How strong should my password be?', a: 'At least 8 characters, ideally 12+. Mix uppercase, lowercase, numbers, and symbols. The live strength meter in the UI will guide you.' },
      { q: 'Can I hide without a password?', a: 'Yes, but the payload will be embedded unencrypted — anyone with StegaVault can extract it. Only use password-less mode for non-sensitive testing.' },
    ],
  },
  {
    category: 'Account',
    icon: User,
    items: [
      { q: 'How do I change my password?', a: 'Go to Settings → Security tab. Enter your current password, set a new one, and click "Update Password".' },
      { q: 'How do I delete my account?', a: 'Go to Settings → Danger Zone tab. Type DELETE to confirm, then click "Permanently Delete Account". This removes everything — account, history, all data. Cannot be undone.' },
      { q: 'Can I export my operation history?', a: 'Not yet — but a CSV/JSON export option is coming soon. For now, you can browse your full history on the History page.' },
    ],
  },
]

const QUICK_LINKS = [
  { icon: Mail, title: 'Email Support', desc: 'Get a response within 24 hours.', action: 'mailto:support@stegavault.io', label: 'support@stegavault.io', color: 'text-[#10B981]', bg: 'bg-emerald-500/10' },
  { icon: FileText, title: 'Documentation', desc: 'Detailed guides & API references.', action: '/docs', label: 'Read Docs →', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: LifeBuoy, title: 'Community', desc: 'Ask questions, share tips.', action: 'https://github.com', label: 'Join Community →', color: 'text-purple-400', bg: 'bg-purple-500/10' },
] as const

const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl', 'H'], action: 'Go to Hide Secret' },
  { keys: ['Ctrl', 'E'], action: 'Go to Extract Secret' },
  { keys: ['Ctrl', 'K'], action: 'Open Quick Search' },
  { keys: ['Esc'], action: 'Close current modal / loader' },
] as const

const NOTICE_STYLES: Record<Notice extends null ? never : 'success' | 'error' | 'info', { classes: string; icon: LucideIcon }> = {
  success: { classes: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', icon: CheckCircle2 },
  error:   { classes: 'bg-red-500/10 border-red-500/30 text-red-400',             icon: AlertCircle },
  info:    { classes: 'bg-amber-500/10 border-amber-500/30 text-amber-400',       icon: Info },
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function Help() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [openItem, setOpenItem] = useState<string | null>(null)

  const [contactEmail, setContactEmail] = useState('')
  const [contactSubject, setContactSubject] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactLoading, setContactLoading] = useState(false)
  const [contactNotice, setContactNotice] = useState<Notice>(null)

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase()
    return FAQ_DATA
      .filter((cat) => activeCategory === 'all' || cat.category === activeCategory)
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            !term ||
            item.q.toLowerCase().includes(term) ||
            item.a.toLowerCase().includes(term),
        ),
      }))
      .filter((cat) => cat.items.length > 0)
  }, [search, activeCategory])

  const totalResults = filteredCategories.reduce((acc, c) => acc + c.items.length, 0)

  const clearContactFields = () => {
    setContactEmail('')
    setContactSubject('')
    setContactMessage('')
  }

  const handleContactSubmit = async () => {
    setContactNotice(null)

    if (!isValidEmail(contactEmail.trim())) {
      return setContactNotice({ kind: 'error', text: 'Please enter a valid email address.' })
    }
    if (!contactSubject.trim()) {
      return setContactNotice({ kind: 'error', text: 'Please enter a subject.' })
    }
    if (contactMessage.trim().length < 10) {
      return setContactNotice({ kind: 'error', text: 'Message must be at least 10 characters.' })
    }

    setContactLoading(true)
    try {
      await api.post('/support/contact', {
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
      })
      setContactNotice({ kind: 'success', text: "Message sent successfully. We'll respond within 24 hours." })
      clearContactFields()
    } catch {
      const mailto = `mailto:support@stegavault.io?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(`${contactMessage}\n\nFrom: ${contactEmail}`)}`
      window.location.href = mailto
      setContactNotice({
        kind: 'info',
        text: 'Form service is unavailable right now. We opened your email client — please send the message from there.',
      })
      clearContactFields()
    } finally {
      setContactLoading(false)
    }
  }

  const noticeStyles = contactNotice ? NOTICE_STYLES[contactNotice.kind] : null
  const NoticeIcon = noticeStyles?.icon

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 selection:bg-emerald-500 selection:text-black">
      <Loader show={contactLoading} title="Sending Message..." subtitle="Encrypting and dispatching to our team" />

      {/* HERO */}
      <div className="rounded-2xl bg-[#131920] border border-slate-800 p-6 md:p-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
              Help & Support
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            How can we <span className="text-[#10B981]">help you?</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Browse FAQs, read guides, or reach out to our team.</p>
        </div>
        <HelpCircle size={48} className="text-emerald-500/20 hidden md:block" />
      </div>

      {/* QUICK LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUICK_LINKS.map((link) => (
          <a
            key={link.title}
            href={link.action}
            target={link.action.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="group p-5 rounded-2xl bg-[#131920] border border-slate-800 hover:border-[#10B981]/50 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${link.bg} ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <link.icon size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">{link.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{link.desc}</p>
            <p className={`text-xs font-bold mt-3 ${link.color}`}>{link.label}</p>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <div className="rounded-2xl bg-[#131920] border border-slate-800 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-[#10B981]" /> Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} found
          </p>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs... (e.g. 'password', 'capacity')"
            className="w-full bg-[#0B0F14] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#10B981] outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeCategory === 'all'
                ? 'bg-[#10B981] text-black'
                : 'bg-[#0B0F14] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All
          </button>
          {FAQ_DATA.map((cat) => (
            <button
              key={cat.category}
              type="button"
              aria-pressed={activeCategory === cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeCategory === cat.category
                  ? 'bg-[#10B981] text-black'
                  : 'bg-[#0B0F14] text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <cat.icon size={11} /> {cat.category}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Search size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-white">No results found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try different keywords or{' '}
                <button
                  type="button"
                  onClick={() => { setSearch(''); setActiveCategory('all') }}
                  className="text-[#10B981] hover:underline"
                >
                  clear filters
                </button>
                .
              </p>
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <h3 className="text-xs font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
                  <cat.icon size={12} /> {cat.category}
                </h3>
                {cat.items.map((item, idx) => {
                  const itemKey = `${cat.category}-${idx}`
                  const isOpen = openItem === itemKey
                  const panelId = `faq-panel-${itemKey}`
                  return (
                    <div key={itemKey} className="rounded-xl bg-[#0B0F14] border border-slate-800 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenItem(isOpen ? null : itemKey)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-900/30 transition-colors"
                      >
                        <span className="text-xs font-bold text-white flex-1">{item.q}</span>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={14} className="text-slate-400" />
                        </motion.div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={panelId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/70 pt-3">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* KEYBOARD SHORTCUTS */}
      <div className="rounded-2xl bg-[#131920] border border-slate-800 p-6">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Keyboard size={16} className="text-[#10B981]" /> Keyboard Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {KEYBOARD_SHORTCUTS.map((s) => (
            <div key={s.action} className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F14] border border-slate-800">
              <span className="text-xs text-slate-400">{s.action}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-white">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTACT FORM */}
      <div className="rounded-2xl bg-[#131920] border border-slate-800 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare size={16} className="text-[#10B981]" /> Still need help?
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Send us a direct message — we typically respond within 24 hours.
          </p>
        </div>

        <AnimatePresence>
          {contactNotice && noticeStyles && NoticeIcon && (
            <motion.div
              key={contactNotice.kind}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${noticeStyles.classes}`}
            >
              <NoticeIcon size={14} /> {contactNotice.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="text-xs font-bold text-slate-400">Your Email</label>
            <input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#10B981] outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contact-subject" className="text-xs font-bold text-slate-400">Subject</label>
            <input
              id="contact-subject"
              type="text"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              placeholder="e.g. Cannot extract from PNG"
              className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#10B981] outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-message" className="text-xs font-bold text-slate-400">Message</label>
          <textarea
            id="contact-message"
            rows={5}
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="Describe your issue in detail — screenshots or file names help us debug faster."
            className="w-full bg-[#0B0F14] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#10B981] outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <Lock size={10} /> Your message is encrypted in transit.
          </p>
          <button
            type="button"
            onClick={handleContactSubmit}
            disabled={contactLoading}
            className="px-5 py-2.5 rounded-lg bg-[#10B981] text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2"
          >
            {contactLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Send size={14} /> Send Message</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}