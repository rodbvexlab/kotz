import React, { useState, useId } from 'react'

// Self-contained class merging helper
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

const GLASS_SHADOW =
  'shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]'

interface GlassFilterProps {
  id: string
  scale?: number
}

const GlassFilter = React.memo(({ id, scale = 10 }: GlassFilterProps) => (
  <svg aria-hidden="true" className="hidden" focusable={false}>
    <title>Glass Effect Filter</title>
    <defs>
      <filter
        colorInterpolationFilters="sRGB"
        height="200%"
        id={id}
        width="200%"
        x="-50%"
        y="-50%"
      >
        <feTurbulence
          baseFrequency="0.05 0.05"
          numOctaves="1"
          result="turbulence"
          seed="1"
          type="fractalNoise"
        />
        <feGaussianBlur
          in="turbulence"
          result="blurredNoise"
          stdDeviation="1.5"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurredNoise"
          result="displaced"
          scale={scale}
          xChannelSelector="R"
          yChannelSelector="B"
        />
        <feGaussianBlur in="displaced" result="finalBlur" stdDeviation="3" />
        <feComposite in="finalBlur" in2="finalBlur" operator="over" />
      </filter>
    </defs>
  </svg>
))
GlassFilter.displayName = 'GlassFilter'

interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: number
  hoverEffect?: boolean
}

export function LiquidGlassCard({
  className,
  scale = 10, // Otimizado para legibilidade (escala menor para não distorcer gráficos/textos)
  hoverEffect = true,
  children,
  style,
  ...props
}: LiquidGlassCardProps) {
  const filterId = useId()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      <div
        className={cn(
          'relative overflow-hidden rounded-[14px]',
          'bg-white/[0.03] backdrop-blur-[24px] saturate-[175%]',
          'border border-white/[0.05]',
          'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          className
        )}
        style={{
          ...style,
          ...(hoverEffect && isHovered ? {
            transform: 'translateY(-2px)',
            background: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.10)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.12)',
          } : {
            boxShadow: '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
          }),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Camada de Sombra Glass complexa em profundidade */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300',
            GLASS_SHADOW,
            isHovered ? 'opacity-100' : 'opacity-70'
          )}
        />

        {/* Backdrop Refractivo */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
          style={{ backdropFilter: `url("#${filterId}")`, WebkitBackdropFilter: `url("#${filterId}")` }}
        />

        {/* Conteúdo do cartão */}
        <div className="relative z-10">{children}</div>

        {/* Overlay do hover light */}
        <div className={cn(
          'pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 ease-out',
          isHovered && 'opacity-100'
        )} />
      </div>

      <GlassFilter id={filterId} scale={scale} />
    </>
  )
}
