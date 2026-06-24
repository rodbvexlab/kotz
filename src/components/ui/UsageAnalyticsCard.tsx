import { useEffect, useState, useId } from 'react'
import { motion } from 'motion/react'
import { LiquidGlassCard } from './LiquidGlassCard'

interface UsageAnalyticsCardProps {
  label: string
  value: number
  loading?: boolean
  accentColor?: string
  icon?: React.ReactNode
}

export function UsageAnalyticsCard({
  label,
  value,
  loading = false,
  accentColor = '#FF6500',
}: Omit<UsageAnalyticsCardProps, 'icon'>) {
  const gradId = useId()
  const normalizedLabel = label.toUpperCase().trim()

  const SPARKLINE_PATHS: Record<string, { path: string; fill: string }> = {
    'LEADS ATIVOS': {
      path: 'M 0 30 C 30 30, 45 10, 60 20 C 75 30, 90 4, 120 7',
      fill: 'M 0 30 C 30 30, 45 10, 60 20 C 75 30, 90 4, 120 7 L 120 40 L 0 40 Z',
    },
    'PROPOSTAS ENVIADAS': {
      path: 'M 0 26 C 30 7, 45 34, 60 17 C 75 2, 90 24, 120 10',
      fill: 'M 0 26 C 30 7, 45 34, 60 17 C 75 2, 90 24, 120 10 L 120 40 L 0 40 Z',
    },
    'FECHADOS NO MÊS': {
      path: 'M 0 34 C 30 34, 45 24, 60 14 C 75 4, 90 4, 120 3',
      fill: 'M 0 34 C 30 34, 45 24, 60 14 C 75 4, 90 4, 120 3 L 120 40 L 0 40 Z',
    },
    'TAXA DE CONVERSÃO': {
      path: 'M 0 24 C 30 24, 45 10, 60 14 C 75 18, 90 6, 120 3',
      fill: 'M 0 24 C 30 24, 45 10, 60 14 C 75 18, 90 6, 120 3 L 120 40 L 0 40 Z',
    },
  }

  const defaultSparkline = {
    path: 'M 0 30 C 30 30, 45 10, 60 20 C 75 30, 90 4, 120 7',
    fill: 'M 0 30 C 30 30, 45 10, 60 20 C 75 30, 90 4, 120 7 L 120 40 L 0 40 Z',
  }

  const sparkline = SPARKLINE_PATHS[normalizedLabel] || defaultSparkline

  return (
    <LiquidGlassCard
      style={{
        padding: '22px 24px',
        transition: 'opacity 400ms ease',
        opacity: loading ? 0.5 : 1,
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="mb-3">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: '#A1B5CC' }}
        >
          {label}
        </p>
      </div>

      {loading ? (
        <div
          className="skeleton-shimmer"
          style={{
            height: '56px',
            width: '120px',
            borderRadius: '8px',
            marginBottom: '12px',
          }}
        />
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-black text-white mb-3"
          style={{ fontSize: '56px', fontFamily: 'Inter, sans-serif', letterSpacing: '-3px', lineHeight: 1 }}
        >
          <CountUp target={value} />
        </motion.p>
      )}

      {/* Sparkline SVG 40px height */}
      <div className="w-full mt-2 select-none relative overflow-hidden" style={{ height: '40px' }}>
        <svg
          viewBox="0 0 120 40"
          className="w-full block"
          style={{ height: '40px' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.40" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.00" />
            </linearGradient>
          </defs>
          <motion.path
            d={sparkline.path}
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ opacity: 0.80 }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.80 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          />
          <motion.path
            d={sparkline.fill}
            fill={`url(#${gradId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
      </div>
    </LiquidGlassCard>
  )
}

function CountUp({ target }: { target: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (target === 0) { setDisplay(0); return }
    const duration = 800
    const start = performance.now()
    let raf: number

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return <>{display}</>
}
