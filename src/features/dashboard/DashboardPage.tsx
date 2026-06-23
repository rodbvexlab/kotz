import { useState } from 'react'
import { useTenant } from '@/lib/tenant'
import { useDashboardMetrics } from './hooks/useDashboardMetrics'
import { useChartData } from './hooks/useChartData'
import { AppNav } from '@/components/layout/AppNav'

const CARDS = [
  { id: 'leads',     label: 'LEADS ATIVOS',       accent: '#4A7FA5',            key: 'total_leads'    },
  { id: 'propostas', label: 'PROPOSTAS ENVIADAS',  accent: 'rgba(255,101,0,0.8)', key: 'total_propostas' },
  { id: 'fechados',  label: 'FECHADOS NO MÊS',     accent: '#FF6500',            key: 'fechados_mes'   },
] as const

export function DashboardPage() {
  const { tenant } = useTenant()
  const { metrics, loading } = useDashboardMetrics()
  const { data: chartData, loading: chartLoading } = useChartData()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const tenantName = (tenant?.name ?? '').replace(/\b\w/g, c => c.toUpperCase())

  const displayMetrics = metrics ?? {
    total_leads: 0,
    total_propostas: 0,
    fechados_mes: 0,
    taxa_conversao: 0,
  }

  // SVG chart config
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

  const lineD = points.length > 1
    ? points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')
    : ''

  const areaD = points.length > 1
    ? `${lineD} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
    : ''

  const hasEnoughData = chartData.length > 1

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="ds-spinner" />
          <p className="text-[#A1B5CC] text-xs font-mono">Carregando painel de controle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen text-white flex flex-col font-sans selection:bg-[#FF6500] selection:text-white">
      <AppNav />

      <main className="relative flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Olá{tenantName ? `, ${tenantName}` : ''} 👋
          </h1>
          <p className="text-sm text-[#A1B5CC] mt-1">
            Visão geral do seu funil
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {CARDS.map(({ id, label, accent, key }) => (
            <div key={id} style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderLeft: `3px solid ${accent}`,
              borderRadius: '12px',
              padding: '20px 24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}>
              <p style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(161,181,204,0.7)',
                marginBottom: '10px',
              }}>{label}</p>

              <p style={{
                fontSize: '48px',
                fontWeight: 700,
                lineHeight: 1,
                fontFamily: 'Inter, sans-serif',
                color: 'white',
                letterSpacing: '-1px',
                marginBottom: '14px',
              }}>{displayMetrics[key]}</p>

              <svg width="100%" height="24" viewBox="0 0 180 24" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity="0.20"/>
                    <stop offset="100%" stopColor={accent} stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path
                  d="M0,20 C45,18 90,14 135,10 C158,8 170,6 180,4 L180,24 L0,24 Z"
                  fill={`url(#sg-${id})`}
                />
                <path
                  d="M0,20 C45,18 90,14 135,10 C158,8 170,6 180,4"
                  fill="none"
                  stroke={accent}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* Evolução do Pipeline */}
        <div className="bg-[#0B192C]/50 backdrop-blur-md border border-[#1E3E62]/30 rounded-xl p-6 shadow-md relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Evolução do Pipeline</h2>
              <p className="text-xs text-[#A1B5CC] mt-0.5">Leads criados por semana de prospecção</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6500]" />
              <span className="text-white">Leads Criados</span>
            </div>
          </div>

          {chartLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[220px] gap-3">
              <div className="ds-spinner" />
              <p className="text-[10px] font-mono text-[#A1B5CC]/60">Carregando dados do gráfico...</p>
            </div>
          ) : hasEnoughData ? (
            <div className="relative w-full overflow-x-auto min-h-[220px]">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full min-w-[500px] h-auto block select-none"
              >
                <g stroke="rgba(30,62,98,0.20)" strokeWidth="1">
                  <line x1={paddingX} y1={20} x2={svgWidth - paddingX} y2={20} />
                  <line x1={paddingX} y1={120} x2={svgWidth - paddingX} y2={120} />
                  <line x1={paddingX} y1={220} x2={svgWidth - paddingX} y2={220} />
                </g>

                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6500" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FF6500" stopOpacity="0.00" />
                  </linearGradient>
                </defs>
                {areaD && <path d={areaD} fill="url(#areaGrad)" />}
                {lineD && (
                  <path d={lineD} fill="none" stroke="#FF6500" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                )}

                {points.map((p, i) => {
                  const isHovered = hoveredIndex === i
                  return (
                    <g key={i}>
                      {isHovered && (
                        <line x1={p.x} y1={chartPadT} x2={p.x} y2={baselineY}
                          stroke="#FF6500" strokeWidth="1" strokeDasharray="2 2" />
                      )}
                      <text x={p.x} y={svgHeight - 10} fill="#A1B5CC" fontSize="9"
                        fontFamily="JetBrains Mono, monospace" textAnchor="middle"
                        opacity={isHovered ? 1 : 0.6}>
                        {p.semana}
                      </text>
                      <circle cx={p.x} cy={p.y} r={isHovered ? 6 : 4}
                        fill={isHovered ? '#FF6500' : '#0B192C'}
                        stroke="#FF6500" strokeWidth={isHovered ? 2.5 : 1.5}
                        className="transition-all duration-150" />
                    </g>
                  )
                })}

                {points.map((p, i) => (
                  <rect key={i}
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
                  className="absolute pointer-events-none bg-[#0B192C] border border-[#1E3E62]/60 px-3 py-2 rounded-lg shadow-xl text-xs flex flex-col font-mono z-20 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                    top: `${(points[hoveredIndex].y / svgHeight) * 100 - 15}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <span className="text-[#A1B5CC]/70 text-[9px] uppercase tracking-wider">
                    {points[hoveredIndex].semana}
                  </span>
                  <span className="text-white font-bold mt-0.5">
                    Leads: <span className="text-[#FF6500] font-bold">{points[hoveredIndex].leads_criados}</span>
                  </span>
                  <span className="text-[#A1B5CC] text-[10px] mt-0.5">
                    Propostas: {points[hoveredIndex].propostas}
                  </span>
                  <span className="text-[#A1B5CC] text-[10px] mt-0.5">
                    Fechados: {points[hoveredIndex].fechados}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '160px',
              gap: '6px',
            }}>
              <p style={{ color: 'rgba(161,181,204,0.40)', fontSize: '13px', textAlign: 'center' }}>
                Crie mais leads para ver a evolução semanal
              </p>
              <a href="/pipeline" style={{
                color: '#FF6500',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
              }}>
                Ir para o Pipeline →
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
