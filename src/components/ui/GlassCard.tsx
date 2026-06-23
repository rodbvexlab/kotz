import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'metric' | 'overlay'
  accentColor?: string  // hex — default: '#FF6500'
  onClick?: () => void
}

export function GlassCard({
  children,
  className = '',
  variant = 'default',
  accentColor = '#FF6500',
  onClick
}: GlassCardProps) {
  
  const hexToRgbaStr = (hex: string, alpha: number) => {
    const cleanHex = hex.replace('#', '')
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const baseStyles = 'relative transition-all duration-300'
  const clickStyles = onClick ? 'cursor-pointer select-none active:scale-[0.99]' : ''

  let variantStyles = ''
  let customStyle: React.CSSProperties = {}

  if (variant === 'metric') {
    variantStyles = 'overflow-hidden'
    customStyle = {
      background: 'rgba(255, 255, 255, 0.04)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.10)',
      borderTop: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, 0.6),
        0 2px 8px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.10),
        inset 0 -1px 0 rgba(0, 0, 0, 0.20)
      `,
      borderRadius: '16px',
    }
  } else if (variant === 'overlay') {
    variantStyles = 'rounded-none'
    customStyle = {
      background: 'rgba(0, 0, 0, 0.60)',
      backdropFilter: 'blur(24px) saturate(200%)',
      WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    }
  } else {
    // default
    variantStyles = ''
    customStyle = {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      borderRadius: '12px',
    }
  }

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${clickStyles} ${variantStyles} ${className}`}
      style={customStyle}
    >
      {children}
    </div>
  )
}
