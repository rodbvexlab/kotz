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
    variantStyles = 'backdrop-blur-[16px] backdrop-saturate-[180%] bg-[#0B192C]/60 rounded-2xl glass-metric overflow-hidden'
    customStyle = {
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderTop: `1px solid ${hexToRgbaStr(accentColor, 0.3)}`,
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
    }
  } else if (variant === 'overlay') {
    variantStyles = 'backdrop-blur-[24px] backdrop-saturate-[200%] bg-[#0B192C]/75 rounded-none'
    customStyle = {
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
    }
  } else {
    // default
    variantStyles = 'backdrop-blur-[12px] bg-[#0B192C]/50 rounded-xl'
    customStyle = {
      border: '1px solid rgba(30, 62, 98, 0.3)'
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
