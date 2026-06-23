import { Magnet } from 'lucide-react'
import { motion, useAnimation } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'

// Self-contained class merging helper
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

interface AttractButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  particleCount?: number;
  attractRadius?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

export default function AttractButton({
  className,
  particleCount = 16,
  attractRadius = 50,
  children,
  ...props
}: AttractButtonProps) {
  const [isAttracting, setIsAttracting] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const particlesControl = useAnimation()

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 260 - 130,
      y: Math.random() * 120 - 60,
    }))
    setParticles(newParticles)
  }, [particleCount])

  const handleInteractionStart = useCallback(async () => {
    setIsAttracting(true)
    await particlesControl.start({
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 10,
      },
    })
  }, [particlesControl])

  const handleInteractionEnd = useCallback(async () => {
    setIsAttracting(false)
    await particlesControl.start((i) => ({
      x: particles[i].x,
      y: particles[i].y,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    }))
  }, [particlesControl, particles])

  return (
    <button
      className={cn(
        'relative min-w-40 touch-none overflow-hidden',
        'bg-[#112236] hover:bg-[#162d47]',
        'text-white font-semibold rounded-lg py-2.5 text-sm',
        'border border-[#1E3E62]/50 hover:border-[#FF6500]/50',
        'transition-all duration-300 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchEnd={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      {...props}
    >
      {particles.map((_, index) => (
        <motion.div
          animate={particlesControl}
          className={cn(
            'absolute h-1 w-1 rounded-full left-1/2 top-1/2 -ml-0.5 -mt-0.5',
            'bg-[#FF6500] shadow-[0_0_6px_#FF6500]',
            'transition-opacity duration-300 pointer-events-none',
            isAttracting ? 'opacity-100' : 'opacity-35'
          )}
          custom={index}
          initial={{ x: particles[index]?.x ?? 0, y: particles[index]?.y ?? 0 }}
          key={index}
        />
      ))}
      <span className="relative flex w-full items-center justify-center gap-2 z-10 pointer-events-none">
        <Magnet
          className={cn(
            'h-4 w-4 transition-transform duration-300',
            isAttracting && 'scale-110 rotate-12 text-[#FF6500]'
          )}
        />
        {children}
      </span>
    </button>
  )
}
