// src/pages/ComingSoon.tsx
import { Link, useLocation } from 'react-router-dom'
import {
  Music,
  Video,
  ScanSearch,
  ArrowLeft,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'

type ModuleInfo = {
  title: string
  tagline: string
  description: string
  icon: typeof Music
  accent: 'primary' | 'cyan' | 'purple'
  roadmap: { label: string; eta: string }[]
}

const MODULES: Record<string, ModuleInfo> = {
  '/stego/audio': {
    title: 'Audio Steganography',
    tagline: 'Inaudible data embedding in WAV and MP3 carriers',
    description:
      'Encode AES-256-GCM encrypted payloads into PCM sample frames using spectral spread techniques that survive normal playback, compression, and editing.',
    icon: Music,
    accent: 'cyan',
    roadmap: [
      { label: 'WAV (PCM 16-bit) carrier support', eta: 'Q1 2026' },
      { label: 'MP3 frame-level embedding', eta: 'Q1 2026' },
      { label: 'Echo hiding + phase coding engine', eta: 'Q2 2026' },
    ],
  },
  '/stego/video': {
    title: 'Video Steganography',
    tagline: 'Frame-level payload injection for MP4 and WebM containers',
    description:
      'Distribute encrypted bits across I-frame macroblocks and motion vectors, preserving visual fidelity and playback compatibility across browsers.',
    icon: Video,
    accent: 'purple',
    roadmap: [
      { label: 'MP4 H.264 I-frame LSB engine', eta: 'Q1 2026' },
      { label: 'WebM VP9 adaptive embedding', eta: 'Q2 2026' },
      { label: 'Motion-vector channel encoding', eta: 'Q2 2026' },
    ],
  },
  '/stego/scan': {
    title: 'Stego Scanner',
    tagline: 'Detect hidden payloads across any uploaded media',
    description:
      'Run statistical steganalysis (chi-square, RS analysis, sample-pair analysis) to determine whether a file contains a hidden StegaVault or third-party payload.',
    icon: ScanSearch,
    accent: 'primary',
    roadmap: [
      { label: 'Chi-square LSB detector', eta: 'Q1 2026' },
      { label: 'RS analysis + SPA detection', eta: 'Q2 2026' },
      { label: 'ML-based universal steganalysis', eta: 'Q3 2026' },
    ],
  },
}

const FALLBACK: ModuleInfo = {
  title: 'Coming Soon',
  tagline: 'This module is under active development',
  description:
    'The module you tried to access is not yet available. Return to the dashboard to continue using image steganography.',
  icon: Sparkles,
  accent: 'primary',
  roadmap: [],
}

export default function ComingSoon() {
  const { pathname } = useLocation()
  const info = MODULES[pathname] ?? FALLBACK

  const accentClasses =
    info.accent === 'cyan'
      ? {
          bg: 'bg-accent-cyan/10',
          border: 'border-accent-cyan/30',
          text: 'text-accent-cyan',
          glow: 'shadow-[0_0_30px_rgba(0,217,255,0.2)]',
        }
      : info.accent === 'purple'
        ? {
            bg: 'bg-accent-purple/10',
            border: 'border-accent-purple/30',
            text: 'text-accent-purple',
            glow: 'shadow-[0_0_30px_rgba(167,139,250,0.2)]',
          }
        : {
            bg: 'bg-primary/10',
            border: 'border-primary/30',
            text: 'text-primary',
            glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
          }

  const Icon = info.icon

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            <span className="label-caps text-warning">MODULE PENDING</span>
            <span className="text-[10px] font-mono text-muted">ROADMAP 2026</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {info.title}
          </h1>
          <p className="text-sm text-muted-bright mt-1">{info.tagline}</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-white font-semibold hover:border-primary/40 transition-all self-start sm:self-auto"
        >
          <ArrowLeft size={15} />
          Dashboard
        </Link>
      </div>

      {/* MAIN CARD */}
      <GlassCard padding="lg">
        <div className="flex flex-col md:flex-row items-start gap-5">
          <div
            className={`w-16 h-16 rounded-2xl ${accentClasses.bg} border ${accentClasses.border} flex items-center justify-center ${accentClasses.text} shrink-0 ${accentClasses.glow}`}
          >
            <Icon size={30} />
          </div>
          <div className="flex-1 space-y-4">
            <p className="text-sm text-white leading-relaxed">
              {info.description}
            </p>
            <div
              className={`flex items-center gap-2 text-xs font-mono ${accentClasses.text}`}
            >
              <ShieldCheck size={14} />
              <span>
                Backend integration will use the same AES-256-GCM + Argon2id
                pipeline as Image Steganography.
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ROADMAP */}
      {info.roadmap.length > 0 && (
        <GlassCard padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className={accentClasses.text} />
            <h2 className="font-heading text-lg font-bold text-white">
              Delivery Roadmap
            </h2>
          </div>
          <ul className="space-y-2">
            {info.roadmap.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-bg-deep border border-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full ${accentClasses.bg} ${accentClasses.text} text-[10px] font-mono font-bold flex items-center justify-center shrink-0`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-sm text-white truncate">
                    {item.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider shrink-0 ml-2">
                  {item.eta}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* CTA */}
      <GlassCard padding="lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-base font-bold text-white mb-1 flex items-center gap-2">
              <Zap size={15} className="text-primary" />
              Image steganography is live
            </h3>
            <p className="text-sm text-muted-bright">
              Hide or extract secrets in PNG / JPEG / BMP carriers today.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to="/stego/image"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-bg-deep text-sm font-bold hover:bg-primary-dark transition-colors"
            >
              Hide
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/stego/extract"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-sm font-semibold hover:border-accent-cyan/40 transition-colors"
            >
              Extract
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
