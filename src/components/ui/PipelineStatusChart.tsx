import { motion } from 'motion/react'

interface PipelineStatusChartProps {
  data: Array<{ label: string; value: number }>
}

const STATUS_COLORS: Record<string, string> = {
  novo: '#1E3E62',
  em_contato: '#FF6500',
  proposta: '#F59E0B',
  fechado: '#22C55E',
  perdido: '#52525B',
}

const mapLabelToStatus = (label: string): string => {
  const norm = label.toLowerCase().trim()
  if (norm.includes('novo')) return 'novo'
  if (norm.includes('contato')) return 'em_contato'
  if (norm.includes('proposta')) return 'proposta'
  if (norm.includes('fechado')) return 'fechado'
  if (norm.includes('perdido')) return 'perdido'
  return 'novo'
}

export function PipelineStatusChart({ data }: PipelineStatusChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="w-full flex items-end justify-between px-2 pt-6 pb-2" style={{ minHeight: '180px' }}>
      {data.map((item, index) => {
        const status = mapLabelToStatus(item.label)
        const color = STATUS_COLORS[status] || '#1E3E62'
        const pct = (item.value / maxValue) * 100
        const barHeight = item.value > 0 ? `${pct}%` : '4px'

        return (
          <div key={item.label} className="flex flex-col items-center flex-1 min-w-0 group">
            {/* Número acima da barra: 11px weight-600 white */}
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 + 0.2 }}
              className="text-[11px] font-semibold text-white mb-2 tabular-nums"
            >
              {item.value}
            </motion.span>

            {/* Bar container */}
            <div className="h-[120px] w-full flex items-end justify-center mb-3">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: barHeight }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
                style={{
                  width: '32px',
                  background: `linear-gradient(to top, ${color}15, ${color}60)`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: `1px solid ${color}80`,
                  borderBottom: 'none',
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px',
                  boxShadow: `0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)`,
                }}
                className="relative cursor-pointer transition-all hover:brightness-110"
              />
            </div>

            {/* Label abaixo: 10px JetBrains Mono #A1B5CC truncado */}
            <span
              className="text-[10px] font-mono tracking-wider truncate max-w-full text-center px-1"
              style={{ color: '#A1B5CC', fontFamily: 'JetBrains Mono, monospace' }}
              title={item.label}
            >
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
