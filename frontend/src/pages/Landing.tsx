import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, Lock, Database, ArrowRight, Cpu, FileCheck2, Layers, 
  ChevronDown, Zap, Server, Code2, Image as ImageIcon, Music, 
  Video, Globe, CheckCircle2, Sparkles 
} from 'lucide-react'
import { BinaryRain } from '../components/ui/BinaryRain'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative w-full bg-bg-deep text-text overflow-x-hidden selection:bg-primary selection:text-bg-deep">
      {/* ================= NAVBAR ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-bg-deep/80 backdrop-blur-xl border-b border-white/5 py-3 shadow-2xl'
            : 'bg-gradient-to-b from-black/40 via-black/10 to-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center relative h-10">
          <nav className="hidden md:flex items-center gap-12 lg:gap-20 text-sm font-semibold text-white/80 drop-shadow-md">
            <a href="#matrix" className="hover:text-primary transition-colors">Support Matrix</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#roadmap" className="hover:text-primary transition-colors">Roadmap</a>
            <a href="#architecture" className="hover:text-primary transition-colors">Architecture</a>
          </nav>
          <div className="absolute right-6 flex items-center">
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 hover:border-primary/50 hover:text-primary transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative w-full h-screen min-h-[750px] overflow-hidden flex flex-col items-center justify-center">
        <img
          src="/mountain.jpg"
          alt="Snowy Mountains"
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/80 via-transparent to-bg-deep" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-deep/60 via-transparent to-bg-deep/60" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center mt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono mb-6">
            <Sparkles size={14} />
            v5.0 VISION · UNIVERSAL CROSS-MEDIA HIDING
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] text-white drop-shadow-2xl">
            Hide Anything.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-cyan to-accent-purple drop-shadow-2xl">
              In Any Media.
            </span>
          </h1>

          <p className="mt-8 text-base md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
            StegaVault combines <strong className="text-white">LSB & DWT steganography</strong> with <strong className="text-white">AES-256-GCM encryption</strong>. Hide text, images, audio, or video inside any cover media — from PNGs to WAVs to lossless video.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-bg-deep font-bold hover:bg-primary-dark shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] hover:-translate-y-1 transition-all duration-300"
            >
              Create Free Account
              <ArrowRight size={20} />
            </Link>
            <a
              href="#matrix"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white hover:border-primary/60 hover:bg-black/60 transition-all duration-300"
            >
              View Support Matrix
            </a>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center max-w-4xl mx-auto">
            {[
              { label: 'Encryption', value: 'AES-256-GCM', color: 'text-primary' },
              { label: 'KDF', value: 'Argon2id', color: 'text-accent-cyan' },
              { label: 'Techniques', value: 'LSB + DWT', color: 'text-accent-purple' },
              { label: 'Platform', value: 'FastAPI + React', color: 'text-white' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`font-mono text-xl md:text-2xl font-extrabold ${stat.color} drop-shadow-lg`}>
                  {stat.value}
                </div>
                <div className="text-[10px] md:text-xs text-white/60 mt-1 font-mono uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 z-10">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
            Scroll to explore
          </span>
          <ChevronDown size={20} className="animate-bounce text-primary" />
        </div>
      </section>

      {/* ================= SUPPORT MATRIX ================= */}
      <section id="matrix" className="relative py-24 px-6 bg-bg-deep border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="label-caps text-accent-cyan font-bold">CAPABILITY MATRIX</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 text-white">
              What Can You Hide?
            </h2>
            <p className="text-base text-muted-bright mt-4">
              From same-media hiding to universal cross-media combinations. 
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-bright font-mono text-xs uppercase">
                  <th className="py-4 px-6">Secret Data</th>
                  <th className="py-4 px-6">Cover Media</th>
                  <th className="py-4 px-6">Technique</th>
                  <th className="py-4 px-6 text-right">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { secret: 'Text / Image', cover: 'Image (PNG)', tech: 'LSB + zlib', ver: 'v4.0', icon: ImageIcon },
                  { secret: 'Text / Audio', cover: 'Audio (WAV)', tech: 'DWT', ver: 'v4.1', icon: Music },
                  { secret: 'Text / Image / Video', cover: 'Video (AVI/FFV1)', tech: 'Frame LSB', ver: 'v4.2', icon: Video },
                  { secret: 'Image', cover: 'Audio (WAV)', tech: 'DWT + Compression', ver: 'v5.0', icon: Globe },
                  { secret: 'Audio', cover: 'Image (PNG)', tech: 'LSB + Compression', ver: 'v5.0', icon: Globe },
                  { secret: 'Video', cover: 'Image (PNG)', tech: 'Multi-image + LSB', ver: 'v5.0', icon: Globe },
                  { secret: 'Any File', cover: 'Any Media', tech: 'Universal Pipeline', ver: 'v5.0', icon: Zap },
                ].map((row, i) => {
                  const SecretIcon = row.icon;
                  return (
                    <tr key={i} className="hover:bg-surface/50 transition-colors">
                      <td className="py-4 px-6 text-white flex items-center gap-3">
                        <SecretIcon size={16} className="text-primary" />
                        {row.secret}
                      </td>
                      <td className="py-4 px-6 text-white">{row.cover}</td>
                      <td className="py-4 px-6 text-muted-bright font-mono text-xs">{row.tech}</td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                          row.ver === 'v5.0' ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30' :
                          row.ver === 'v4.2' ? 'bg-warning/10 text-warning border border-warning/20' :
                          row.ver === 'v4.1' ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20' :
                          'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {row.ver}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="relative py-24 px-6 overflow-hidden bg-[#030806]">
        <BinaryRain />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="label-caps text-primary font-bold">CORE CAPABILITIES</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 text-white drop-shadow-lg">
              Defense in Depth
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: 'Cross-Media Hiding',
                desc: 'Hide an image inside a music file, audio inside a video, or any file inside any media. The v5.0 universal pipeline auto-detects types and compresses accordingly.',
              },
              {
                icon: Lock,
                title: 'AES-256-GCM + Argon2id',
                desc: 'Payloads are compressed (zlib), encrypted with authenticated Galois/Counter Mode, and keyed with Argon2id. Tamper detection is mathematically guaranteed.',
              },
              {
                icon: Layers,
                title: 'LSB & DWT Techniques',
                desc: 'Uses Least Significant Bit (LSB) for images and video frames, and Discrete Wavelet Transform (DWT) for audio, ensuring zero perceptual artifacts.',
              },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="p-8 rounded-2xl bg-[#0a1512]/95 backdrop-blur-md border border-[#1a3c33] hover:border-primary/40 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 bg-primary/10 border-primary/30 text-primary">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-sm text-muted-bright leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================= ROADMAP ================= */}
      <section id="roadmap" className="relative py-24 px-6 bg-bg-deep">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="label-caps text-accent-purple font-bold">DEVELOPMENT PLAN</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 text-white">Roadmap to v5.0</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { ver: 'v4.0', title: 'Image MVP', items: ['Text → Image', 'Image → Image', 'FastAPI + Postgres', 'React Frontend'], color: 'text-primary', border: 'border-primary/40' },
              { ver: 'v4.1', title: 'Audio', items: ['Text → Audio', 'Audio → Audio', 'DWT Embedding'], color: 'text-accent-cyan', border: 'border-accent-cyan/40' },
              { ver: 'v4.2', title: 'Video', items: ['Text → Video', 'Image → Video', 'Video → Video', 'FFV1 Codec'], color: 'text-warning', border: 'border-warning/40' },
              { ver: 'v5.0', title: 'Cross-Media', items: ['Image → Audio', 'Audio → Image', 'Any File → Any Media', 'AI Steganalysis'], color: 'text-accent-purple', border: 'border-accent-purple/40' },
            ].map((step, i) => (
              <div key={i} className={`p-6 rounded-2xl bg-surface border ${step.border} relative`}>
                <div className={`text-xl font-mono font-bold ${step.color} mb-2`}>{step.ver}</div>
                <h3 className="text-lg font-bold text-white mb-4">{step.title}</h3>
                <ul className="space-y-2 text-xs text-muted-bright">
                  {step.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className={`${step.color} mt-0.5 shrink-0`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ARCHITECTURE ================= */}
      <section id="architecture" className="relative py-24 px-6 bg-bg-deep">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-surface to-bg-deep border border-border flex flex-col md:flex-row items-center justify-between gap-12">
            
            <div className="max-w-xl">
              <span className="text-xs font-mono text-accent-purple tracking-widest uppercase">Modern Stack</span>
              <h3 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">Built for Scale & Security</h3>
              <p className="text-sm text-muted-bright leading-relaxed mb-6">
                The architecture uses an asynchronous FastAPI backend with PostgreSQL for metadata and Cloudflare R2 for file storage. Audio processing is powered by PyWavelets and Soundfile, while video uses OpenCV.
              </p>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-mono">
                <div className="flex items-center gap-2 text-white"><Server size={14} className="text-primary"/> FastAPI + Uvicorn</div>
                <div className="flex items-center gap-2 text-white"><Database size={14} className="text-accent-cyan"/> Neon PostgreSQL</div>
                <div className="flex items-center gap-2 text-white"><Code2 size={14} className="text-accent-purple"/> React 18 + TypeScript</div>
                <div className="flex items-center gap-2 text-white"><Zap size={14} className="text-warning"/> Tailwind CSS</div>
                <div className="flex items-center gap-2 text-white"><Music size={14} className="text-accent-cyan"/> PyWavelets / Soundfile</div>
                <div className="flex items-center gap-2 text-white"><Video size={14} className="text-primary"/> OpenCV / FFmpeg</div>
              </div>
            </div>

            <div className="w-full md:w-80 p-6 rounded-2xl bg-bg-deep/80 border border-border font-mono text-xs text-muted-bright space-y-3">
              <div className="flex justify-between border-b border-border pb-3 text-primary">
                <span>CIPHER</span><span>AES-256-GCM</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3 text-white">
                <span>KDF</span><span>Argon2id (64MB)</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3 text-white">
                <span>IMAGE</span><span>LSB Matrix</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3 text-white">
                <span>AUDIO</span><span>DWT Coefficients</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3 text-white">
                <span>VIDEO</span><span>Frame-by-Frame LSB</span>
              </div>
              <div className="flex justify-between text-accent-cyan pt-1">
                <span>TAMPER DETECT</span><span>GMAC 128-bit</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative py-24 px-6 overflow-hidden bg-bg-deep">
        <div className="absolute inset-0 pointer-events-none opacity-60" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(16,185,129,0.15), transparent 60%)' }} />
        <div className="max-w-4xl mx-auto relative text-center z-10">
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white">
            Ready to Hide Your Secrets?
          </h2>
          <p className="text-lg text-muted-bright mt-4 mb-10 max-w-xl mx-auto">
            Join StegaVault today and experience state-of-the-art multi-media steganography.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 rounded-xl bg-primary text-bg-deep font-bold hover:bg-primary-dark shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all">
              Create Free Account
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-xl bg-surface border border-border text-white hover:border-primary/40 hover:bg-surface-hover transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-border py-8 px-6 bg-bg-deep">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <span className="font-bold text-white">StegaVault</span>
            <span>— Secure Multi-Media Steganography</span>
          </div>
          <p>© {new Date().getFullYear()} StegaVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
