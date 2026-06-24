import { useMemo } from 'react'
import { motion } from 'motion/react'

interface DotMatrixChartProps {
  data: Array<{ label: string; value: number }>
  accentColor?: string
  colors?: string[]
  rows?: number
  cols?: number
}

export function DotMatrixChart({
  data,
  accentColor = '#FF6500',
  colors,
  rows = 8,
}: DotMatrixChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  const columns = useMemo(() => {
    return data.map((item) => {
      const filledRows = Math.round((item.value / maxValue) * rows)
      return { ...item, filledRows }
    })
  }, [data, maxValue, rows])

  const dotSize = 6
  const dotGap = 4
  const colWidth = dotSize + dotGap
  const colGap = 16
  const totalHeight = rows * (dotSize + dotGap) - dotGap

  return (
    <div className="w-full overflow-x-auto">
      <div
        className="flex items-end justify-between"
        style={{ minHeight: totalHeight + 32, gap: `${colGap}px`, padding: '0 4px' }}
      >
        {columns.map((col, colIdx) => (
          <div key={col.label} className="flex flex-col items-center gap-2 flex-1 min-w-0">
            {/* Dot column */}
            <div
              className="flex flex-col-reverse items-center"
              style={{ gap: `${dotGap}px` }}
            >
              {Array.from({ length: rows }, (_, rowIdx) => {
                const isFilled = rowIdx < col.filledRows
                return (
                  <motion.div
                    key={rowIdx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: isFilled ? 1 : 0.15 }}
                    transition={{
                      duration: 0.3,
                      delay: colIdx * 0.06 + rowIdx * 0.03,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      width: dotSize,
                      height: dotSize,
                      borderRadius: '50%',
                      background: isFilled ? (colors?.[colIdx] ?? accentColor) : 'rgba(255,255,255,0.08)',
                      boxShadow: isFilled
                        ? `0 0 ${dotSize}px ${(colors?.[colIdx] ?? accentColor)}40`
                        : 'none',
                    }}
                  />
                )
              })}
            </div>

            {/* Value label */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: colIdx * 0.06 + 0.3 }}
              className="text-[10px] font-mono tabular-nums"
              style={{ color: colors?.[colIdx] ?? accentColor, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {col.value}
            </motion.span>

            {/* Category label */}
            <span
              className="text-[9px] uppercase tracking-[0.08em] truncate max-w-full text-center"
              style={{ color: '#A1B5CC' }}
            >
              {col.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
