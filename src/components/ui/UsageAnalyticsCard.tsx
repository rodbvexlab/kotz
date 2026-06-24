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
      path: 'M 0 18 C 30 18, 45 6, 60 12 C 75 18, 90 2, 120 4',
      fill: 'M 0 18 C 30 18, 45 6, 60 12 C 75 18, 90 2, 120 4 L 120 24 L 0 24 Z',
    },
    'PROPOSTAS ENVIADAS': {
      path: 'M 0 16 C 30 4, 45 20, 60 10 C 75 0, 90 14, 120 6',
      fill: 'M 0 16 C 30 4, 45 20, 60 10 C 75 0, 90 14, 120 6 L 120 24 L 0 24 Z',
    },
    'FECHADOS NO MÊS': {
      path: 'M 0 20 C 30 20, 45 14, 60 8 C 75 2, 90 2, 120 2',
      fill: 'M 0 20 C 30 20, 45 14, 60 8 C 75 2, 90 2, 120 2 L 120 24 L 0 24 Z',
    },
    'TAXA DE CONVERSÃO': {
      path: 'M 0 14 C 30 14, 45 6, 60 8 C 75 10, 90 4, 120 2',
      fill: 'M 0 14 C 30 14, 45 6, 60 8 C 75 10, 90 4, 120 2 L 120 24 L 0 24 Z',
    },
  }

  const defaultSparkline = {
    path: 'M 0 18 C 30 18, 45 6, 60 12 C 75 18, 90 2, 120 4',
    fill: 'M 0 18 C 30 18, 45 6, 60 12 C 75 18, 90 2, 120 4 L 120 24 L 0 24 Z',
  }

  const sparkline = SPARKLINE_PATHS[normalizedLabel] || defaultSparkline

  return (
    <LiquidGlassCard
      style={{
        padding: '22px 24px',
        transition: 'opacity 400ms ease',
        opacity: loading ? 0.5 : 1,
        borderLeft: `3px solid ${accentColor}`,
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
          className="font-black leading-none tracking-[-2px] text-white mb-3"
          style={{ fontSize: '56px', fontFamily: 'Inter, sans-serif' }}
        >
          <CountUp target={value} />
        </motion.p>
      )}

      {/* Sparkline SVG 24px height */}
      <div className="h-6 w-full mt-2 select-none relative overflow-hidden">
        <svg
          viewBox="0 0 120 24"
          className="w-full h-6 block"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.00" />
            </linearGradient>
          </defs>
          <motion.path
            d={sparkline.path}
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
          />
          <motion.path
            d={sparkline.fill}
            fill={`url(#${gradId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
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
