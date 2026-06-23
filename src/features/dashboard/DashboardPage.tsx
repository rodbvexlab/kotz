import { useState } from 'react'
import { motion } from 'motion/react'
import { Users, Send, Trophy, TrendingUp } from 'lucide-react'
import { useTenant } from '@/lib/tenant'
import { useDashboardMetrics } from './hooks/useDashboardMetrics'
import { useChartData } from './hooks/useChartData'
import { AppNav } from '@/components/layout/AppNav'
import { BentoGrid, BentoItem } from '@/components/ui/BentoGrid'
import { UsageAnalyticsCard } from '@/components/ui/UsageAnalyticsCard'
import { DotMatrixChart } from '@/components/ui/DotMatrixChart'
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard'

export function DashboardPage() {
  const { tenant } = useTenant()
  const { metrics, loading } = useDashboardMetrics()
  const { data: chartData, loading: chartLoading } = useChartData()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const tenantName = (tenant?.name ?? '').replace(/\b\w/g, c => c.toUpperCase())

  const m = metrics ?? {
    total_leads: 0,
    total_propostas: 0,
    fechados_mes: 0,
    taxa_conversao: 0,
    funnel: [],
  }

  // ─── SVG chart config ────────────────────────────────────────────────────────
  const svgWidth = 600
  const svgHeight = 250
  const paddingX = 40
  const chartWidth = svgWidth - paddingX * 2
  const chartH = 200
  const chartPadT = 20
  const baselineY = chartPadT + chartH

  const maxVal = Math.max(...chartData.map(d => d.leads_criados), 1)

  const points = chartData.map((d, i) => {
    const divisor = chartData.length > 1 ? chartData.length - 1 : 1
    const x = chartData.length === 1
      ? paddingX + chartWidth / 2
      : paddingX + (i / divisor) * chartWidth
    const y = chartData.length === 1
      ? chartPadT
      : chartPadT + chartH - (d.leads_criados / maxVal) * chartH
    return { x, y, ...d }
  })

  const buildSmoothPath = (pts: typeof points): string => {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3
      const cp1y = pts[i].y
      const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3
      const cp2y = pts[i + 1].y
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i + 1].x} ${pts[i + 1].y}`
    }
    return d
  }

  const lineD = buildSmoothPath(points)
  const areaD = lineD.length > 0
    ? `${lineD} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
    : ''

  const hasEnoughData = chartData.length > 1

  return (
    <div className="relative min-h-screen text-white flex flex-col font-[Inter,system-ui,sans-serif]">
      <AppNav />

      <main className="flex-1 p-6 max-w-[1200px] w-full mx-auto flex flex-col gap-6">

        {/* ─── Page heading with stagger animation ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-[28px] font-bold tracking-[-1px] text-white m-0">
            {tenantName ? `Olá, ${tenantName}` : 'Dashboard'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#A1B5CC' }}>
            Visão geral do seu funil de prospecção
          </p>
        </motion.div>

        {/* ─── Bento Grid: Metric Cards ──────────────────────────────────── */}
        <BentoGrid className="md:grid-cols-4">
          <BentoItem>
            <UsageAnalyticsCard
              label="LEADS ATIVOS"
              value={m.total_leads}
              loading={loading}
              accentColor="#4A7FA5"
              icon={<Users className="w-4 h-4" style={{ color: '#4A7FA5' }} />}
            />
          </BentoItem>
          <BentoItem>
            <UsageAnalyticsCard
              label="PROPOSTAS ENVIADAS"
              value={m.total_propostas}
              loading={loading}
              accentColor="rgba(255,101,0,0.85)"
              icon={<Send className="w-4 h-4" style={{ color: '#FF6500' }} />}
            />
          </BentoItem>
          <BentoItem>
            <UsageAnalyticsCard
              label="FECHADOS NO MÊS"
              value={m.fechados_mes}
              loading={loading}
              accentColor="#FF6500"
              icon={<Trophy className="w-4 h-4" style={{ color: '#FF6500' }} />}
            />
          </BentoItem>
          <BentoItem>
            <UsageAnalyticsCard
              label="TAXA DE CONVERSÃO"
              value={m.taxa_conversao}
              loading={loading}
              accentColor="#22C55E"
              icon={<TrendingUp className="w-4 h-4" style={{ color: '#22C55E' }} />}
            />
          </BentoItem>
        </BentoGrid>

        {/* ─── Bento Grid: Charts Row ────────────────────────────────────── */}
        <BentoGrid className="md:grid-cols-3">

          {/* Pipeline Chart — spans 2 cols */}
          <BentoItem colSpan={2}>
            <LiquidGlassCard style={{ padding: '24px', position: 'relative', height: '100%' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[16px] font-semibold text-white tracking-[-0.3px] m-0">
                    Evolução do Pipeline
                  </h2>
                  <p className="text-xs mt-1 m-0" style={{ color: '#A1B5CC' }}>
                    Leads criados por semana
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: '#A1B5CC' }}>
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{
                      background: 'linear-gradient(135deg, #FF6500, #e85500)',
                      boxShadow: '0 0 6px rgba(255,101,0,0.40)',
                    }}
                  />
                  <span className="text-white">Leads</span>
                </div>
              </div>

              {chartLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[220px] gap-3">
                  <div className="ds-spinner" />
                  <p className="text-[10px] font-mono" style={{ color: 'rgba(161,181,204,0.6)' }}>
                    Carregando dados...
                  </p>
                </div>
              ) : hasEnoughData ? (
                <div className="relative w-full overflow-x-auto min-h-[220px]">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full min-w-[500px] h-auto block select-none"
                  >
                    <g stroke="rgba(30,62,98,0.20)" strokeWidth="1">
                      <line x1={paddingX} y1={chartPadT} x2={svgWidth - paddingX} y2={chartPadT} />
                      <line x1={paddingX} y1={chartPadT + chartH / 2} x2={svgWidth - paddingX} y2={chartPadT + chartH / 2} />
                      <line x1={paddingX} y1={baselineY} x2={svgWidth - paddingX} y2={baselineY} />
                    </g>

                    <defs>
                      <linearGradient id="pipelineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF6500" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#FF6500" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    {areaD && <path d={areaD} fill="url(#pipelineAreaGrad)" />}
                    {lineD && (
                      <path
                        d={lineD}
                        fill="none"
                        stroke="#FF6500"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {points.map((p, i) => {
                      const isHovered = hoveredIndex === i
                      return (
                        <g key={i}>
                          {isHovered && (
                            <line
                              x1={p.x} y1={chartPadT} x2={p.x} y2={baselineY}
                              stroke="rgba(255,101,0,0.30)"
                              strokeWidth="1"
                              strokeDasharray="3 3"
                            />
                          )}
                          <text
                            x={p.x} y={svgHeight - 8}
                            fill="#A1B5CC"
                            fontSize="11"
                            fontFamily="JetBrains Mono, monospace"
                            textAnchor="middle"
                            opacity={isHovered ? 1 : 0.6}
                          >
                            {p.semana}
                          </text>
                          <circle
                            cx={p.x} cy={p.y}
                            r={isHovered ? 5 : 3}
                            fill={isHovered ? '#FF6500' : 'rgba(8,12,20,0.9)'}
                            stroke="#FF6500"
                            strokeWidth={isHovered ? 2 : 1.5}
                            style={{
                              transition: 'all 150ms ease',
                              filter: isHovered ? 'drop-shadow(0 0 4px rgba(255,101,0,0.6))' : 'none',
                            }}
                          />
                        </g>
                      )
                    })}

                    {points.map((p, i) => (
                      <rect
                        key={i}
                        x={p.x - chartWidth / (chartData.length - 1 || 1) / 2}
                        y={chartPadT}
                        width={chartWidth / (chartData.length - 1 || 1)}
                        height={chartH}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    ))}
                  </svg>

                  {hoveredIndex !== null && points[hoveredIndex] && (
                    <div
                      style={{
                        position: 'absolute',
                        pointerEvents: 'none',
                        background: 'rgba(8, 12, 20, 0.90)',
                        backdropFilter: 'blur(20px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                        border: '1px solid rgba(255, 255, 255, 0.10)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
                        padding: '8px 12px',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono, monospace',
                        zIndex: 20,
                        left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                        top: `${(points[hoveredIndex].y / svgHeight) * 100 - 15}%`,
                        transform: 'translate(-50%, -100%)',
                        display: 'flex',
                        flexDirection: 'column' as const,
                        gap: '3px',
                        minWidth: '110px',
                      }}
                    >
                      <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: 'rgba(161,181,204,0.7)' }}>
                        {points[hoveredIndex].semana}
                      </span>
                      <span className="text-white font-bold text-xs">
                        Leads: <span style={{ color: '#FF6500' }}>{points[hoveredIndex].leads_criados}</span>
                      </span>
                      <span className="text-[10px]" style={{ color: '#A1B5CC' }}>
                        Propostas: {points[hoveredIndex].propostas}
                      </span>
                      <span className="text-[10px]" style={{ color: '#A1B5CC' }}>
                        Fechados: {points[hoveredIndex].fechados}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-xl p-12 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3">
                    <path
                      d="M4 24 L10 16 L16 18 L22 10 L28 8"
                      stroke="rgba(30,62,98,0.45)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="28" cy="8" r="2" fill="rgba(30,62,98,0.45)" />
                  </svg>
                  <p className="text-sm font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                    Sem dados suficientes
                  </p>
                  <p className="text-[13px] mb-4" style={{ color: '#A1B5CC' }}>
                    Crie mais leads para ver a evolução semanal.
                  </p>
                  <a
                    href="/pipeline"
                    className="text-[13px] font-medium no-underline inline-flex items-center gap-1 transition-opacity duration-150 hover:opacity-75"
                    style={{ color: '#FF6500' }}
                  >
                    Ir para o Pipeline →
                  </a>
                </div>
              )}
            </LiquidGlassCard>
          </BentoItem>

          {/* Dot Matrix — Funnel Breakdown */}
          <BentoItem>
            <LiquidGlassCard style={{ padding: '24px', height: '100%' }}>
              <div className="mb-5">
                <h2 className="text-[16px] font-semibold text-white tracking-[-0.3px] m-0">
                  Funil por Status
                </h2>
                <p className="text-xs mt-1 m-0" style={{ color: '#A1B5CC' }}>
                  Distribuição atual dos leads
                </p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[180px] gap-3">
                  <div className="ds-spinner" />
                  <p className="text-[10px] font-mono" style={{ color: 'rgba(161,181,204,0.6)' }}>
                    Carregando funil...
                  </p>
                </div>
              ) : m.funnel.length > 0 && m.funnel.some(f => f.value > 0) ? (
                <DotMatrixChart data={m.funnel} accentColor="#FF6500" rows={7} />
              ) : (
                <div className="flex items-center justify-center min-h-[180px]">
                  <p className="text-[13px]" style={{ color: 'rgba(161,181,204,0.5)' }}>
                    Nenhum lead cadastrado ainda
                  </p>
                </div>
              )}
            </LiquidGlassCard>
          </BentoItem>
        </BentoGrid>

      </main>
    </div>
  )
}
