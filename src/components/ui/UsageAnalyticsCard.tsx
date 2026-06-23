import { useEffect, useState } from 'react'
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
  icon,
}: UsageAnalyticsCardProps) {
  return (
    <LiquidGlassCard
      style={{
        padding: '22px 24px',
        transition: 'opacity 400ms ease',
        opacity: loading ? 0.5 : 1,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: '#A1B5CC' }}
        >
          {label}
        </p>
        {icon && (
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: `${accentColor}10`,
              border: `1px solid ${accentColor}20`,
            }}
          >
            {icon}
          </div>
        )}
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

      {/* Animated bar indicator */}
      <div
        className="h-[3px] rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: accentColor }}
          initial={{ width: 0 }}
          animate={{ width: loading ? '0%' : '100%' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
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
