// src/components/ui/BinaryRain.tsx
import { useMemo } from 'react'

const COLUMN_COUNT = 30
const CHARS_PER_COLUMN = 30

// Seeded random for stable render
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function BinaryRain({ className = '' }: { className?: string }) {
  const columns = useMemo(() => {
    const rand = seededRandom(42)
    return Array.from({ length: COLUMN_COUNT }, (_, colIdx) => ({
      id: colIdx,
      chars: Array.from({ length: CHARS_PER_COLUMN }, () =>
        rand() > 0.5 ? '1' : '0',
      ),
      delay: rand() * 8,
      duration: 6 + rand() * 6,
      opacity: 0.15 + rand() * 0.35,
    }))
  }, [])

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden
    >
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent 0, transparent 39px, rgba(16, 185, 129, 0.12) 39px, rgba(16, 185, 129, 0.12) 40px),
            repeating-linear-gradient(90deg, transparent 0, transparent 39px, rgba(16, 185, 129, 0.12) 39px, rgba(16, 185, 129, 0.12) 40px)
          `,
          animation: 'binary-grid-shift 4s linear infinite',
        }}
      />

      {/* Falling 1s and 0s */}
      <div className="absolute inset-0 flex justify-between">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex flex-col items-center font-mono font-bold"
            style={{
              fontSize: '18px',
              lineHeight: '2',
              color: `rgba(16, 185, 129, ${col.opacity})`,
              textShadow: `0 0 8px rgba(16, 185, 129, ${col.opacity * 1.5})`,
              animation: `binary-fall ${col.duration}s linear ${col.delay}s infinite`,
            }}
          >
            {col.chars.map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Light sweep overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(-62.5deg, transparent 0%, rgba(16,185,129,0.15) 45%, rgba(16,185,129,0.25) 50%, rgba(16,185,129,0.15) 55%, transparent 100%)',
          backgroundSize: '400% 100%',
          mixBlendMode: 'screen',
          animation: 'binary-light-sweep 5s ease-in-out infinite',
        }}
      />

      {/* CSS keyframes injected */}
      <style>{`
        @keyframes binary-fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes binary-grid-shift {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 40px 40px, 40px 40px; }
        }
        @keyframes binary-light-sweep {
          0%, 100% { background-position: 10% 0; }
          50% { background-position: 90% 0; }
        }
      `}</style>
    </div>
  )
}
