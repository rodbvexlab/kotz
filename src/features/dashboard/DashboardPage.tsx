import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTenant } from '@/lib/tenant'
import { useDashboardMetrics } from './hooks/useDashboardMetrics'
import { useChartData } from './hooks/useChartData'
import { AppNav } from '@/components/layout/AppNav'
import { GlassCard } from '@/components/ui/GlassCard'
import { Target } from 'lucide-react'


// Dados mockados para o gráfico SVG de conversão
const MOCK_GRAPH_DATA = [
  { period: 'Semana 1', rate: 10, leads: 3 },
  { period: 'Semana 2', rate: 14, leads: 5 },
  { period: 'Semana 3', rate: 18, leads: 8 },
  { period: 'Semana 4', rate: 15, leads: 7 },
  { period: 'Semana 5', rate: 22, leads: 11 },
  { period: 'Semana 6', rate: 28, leads: 15 },
]

export function DashboardPage() {
  const { tenant } = useTenant()
  const { metrics, loading } = useDashboardMetrics()
  const { data: chartData, loading: chartLoading } = useChartData()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const tenantName = (tenant?.name ?? '').replace(/\b\w/g, c => c.toUpperCase())

  // Sempre mostra os cards — zeros quando não há dados ainda
  const displayMetrics = metrics ?? {
    total_leads: 0,
    total_propostas: 0,
    fechados_mes: 0,
    taxa_conversao: 0,
  }

  // Configurações do SVG
  const svgWidth = 600
  const svgHeight = 250
  const paddingX = 40
  const chartWidth = svgWidth - paddingX * 2
  const chartH = 200  // altura útil do SVG
  const chartPadT = 20  // padding topo
  const baselineY = chartPadT + chartH

  const maxVal = Math.max(...chartData.map(d => d.leads_criados), 1)
  const minVal = 0

  // Gera pontos do gráfico
  const points = chartData.map((d, i) => {
    const divisor = chartData.length > 1 ? chartData.length - 1 : 1
    const x = chartData.length === 1
      ? paddingX + chartWidth / 2
      : paddingX + (i / divisor) * chartWidth
    const val = d.leads_criados
    const y = chartData.length === 1
      ? chartPadT
      : chartPadT + chartH - ((val - minVal) / (maxVal - minVal)) * chartH
    return { x, y, ...d }
  })

  // Constroi string do path do gráfico de linha
  const lineD = points.length > 1
    ? points.reduce((acc, p, i) => {
        return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
      }, '')
    : ''

  // Constroi string do path do gráfico de área
  const areaD = points.length > 1
    ? `${lineD} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
    : ''

  // ─── Loading State ────────────────────────────────────────────────────────
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
    <div className="relative min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#FF6500] selection:text-white">
      <AppNav />

      {/* Main Content */}
      <main className="relative flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Olá{tenantName ? `, ${tenantName}` : ''} 👋
          </h1>
          <p className="text-sm text-[#A1B5CC] mt-1">
            Visão geral do seu funil
          </p>
        </div>

        <>
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Leads Ativos */}
            <div 
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
                borderLeft: '3px solid #1E3E62',
                borderRadius: '16px',
                padding: '28px 24px 20px',
                boxShadow: `
                  0 8px 32px rgba(0,0,0,0.5),
                  0 2px 8px rgba(0,0,0,0.3),
                  inset 0 1px 0 rgba(255,255,255,0.10),
                  inset 0 -1px 0 rgba(0,0,0,0.15)
                `,
              }}
            >
              {/* Shimmer decorativo no canto superior direito */}
              <div style={{
                position: 'absolute',
                top: '-40px', right: '-40px',
                width: '120px', height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #1E3E6218 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Label */}
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#A1B5CC',
                marginBottom: '12px',
              }}>LEADS ATIVOS</p>

              {/* Número grande */}
              <p style={{
                fontSize: '64px',
                fontWeight: 900,
                lineHeight: 1,
                fontFamily: 'Inter, sans-serif',
                color: 'white',
                marginBottom: '16px',
              }}>
                {displayMetrics.total_leads}
              </p>

              {/* Sparkline SVG */}
              <svg width="100%" height="32" viewBox="0 0 200 32">
                <defs>
                  <linearGradient id="spark-leads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E3E62" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#1E3E62" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path
                  d="M0,24 L40,18 L80,20 L120,12 L160,8 L200,4 L200,32 L0,32 Z"
                  fill="url(#spark-leads)"
                />
                <path
                  d="M0,24 L40,18 L80,20 L120,12 L160,8 L200,4"
                  fill="none"
                  stroke="#1E3E62"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Card 2: Propostas Enviadas */}
            <div 
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
                borderLeft: '3px solid rgba(255,101,0,0.7)',
                borderRadius: '16px',
                padding: '28px 24px 20px',
                boxShadow: `
                  0 8px 32px rgba(0,0,0,0.5),
                  0 2px 8px rgba(0,0,0,0.3),
                  inset 0 1px 0 rgba(255,255,255,0.10),
                  inset 0 -1px 0 rgba(0,0,0,0.15)
                `,
              }}
            >
              {/* Shimmer decorativo no canto superior direito */}
              <div style={{
                position: 'absolute',
                top: '-40px', right: '-40px',
                width: '120px', height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,101,0,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Label */}
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#A1B5CC',
                marginBottom: '12px',
              }}>PROPOSTAS ENVIADAS</p>

              {/* Número grande */}
              <p style={{
                fontSize: '64px',
                fontWeight: 900,
                lineHeight: 1,
                fontFamily: 'Inter, sans-serif',
                color: 'white',
                marginBottom: '16px',
              }}>
                {displayMetrics.total_propostas}
              </p>

              {/* Sparkline SVG */}
              <svg width="100%" height="32" viewBox="0 0 200 32">
                <defs>
                  <linearGradient id="spark-propostas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,101,0,0.7)" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="rgba(255,101,0,0.7)" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path
                  d="M0,24 L40,18 L80,20 L120,12 L160,8 L200,4 L200,32 L0,32 Z"
                  fill="url(#spark-propostas)"
                />
                <path
                  d="M0,24 L40,18 L80,20 L120,12 L160,8 L200,4"
                  fill="none"
                  stroke="rgba(255,101,0,0.7)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Card 3: Fechados no Mês */}
            <div 
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
                borderLeft: '3px solid #FF6500',
                borderRadius: '16px',
                padding: '28px 24px 20px',
                boxShadow: `
                  0 8px 32px rgba(0,0,0,0.5),
                  0 2px 8px rgba(0,0,0,0.3),
                  inset 0 1px 0 rgba(255,255,255,0.10),
                  inset 0 -1px 0 rgba(0,0,0,0.15)
                `,
              }}
            >
              {/* Shimmer decorativo no canto superior direito */}
              <div style={{
                position: 'absolute',
                top: '-40px', right: '-40px',
                width: '120px', height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FF650018 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Label */}
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#A1B5CC',
                marginBottom: '12px',
              }}>FECHADOS NO MÊS</p>

              {/* Número grande */}
              <p style={{
                fontSize: '64px',
                fontWeight: 900,
                lineHeight: 1,
                fontFamily: 'Inter, sans-serif',
                color: displayMetrics.fechados_mes > 0 ? '#FF6500' : 'white',
                marginBottom: '16px',
              }}>
                {displayMetrics.fechados_mes}
              </p>

              {/* Sparkline SVG */}
              <svg width="100%" height="32" viewBox="0 0 200 32">
                <defs>
                  <linearGradient id="spark-fechados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6500" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#FF6500" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path
                  d="M0,24 L40,18 L80,20 L120,12 L160,8 L200,4 L200,32 L0,32 Z"
                  fill="url(#spark-fechados)"
                />
                <path
                  d="M0,24 L40,18 L80,20 L120,12 L160,8 L200,4"
                  fill="none"
                  stroke="#FF6500"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* SVG Area Chart Container */}
          <div className="bg-[#0B192C]/50 backdrop-blur-md border border-[#1E3E62]/30 rounded-xl p-6 shadow-md relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Evolução do Pipeline</h2>
                <p className="text-xs text-[#A1B5CC] mt-0.5">Leads criados por semana de prospecção</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6500]" />
                  <span className="text-white">Leads Criados</span>
                </div>
              </div>
            </div>

            {chartLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[220px] gap-3">
                <div className="ds-spinner" />
                <p className="text-[10px] font-mono text-[#A1B5CC]/60">Carregando dados do gráfico...</p>
              </div>
            ) : (
              /* SVG Area Chart wrapper */
              <div className="relative w-full overflow-x-auto min-h-[220px]">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full min-w-[500px] h-auto block select-none"
                >
                  {/* Grid Lines horizontal sutis */}
                  <g stroke="rgba(30,62,98,0.20)" strokeWidth="1">
                    <line x1={paddingX} y1={20} x2={svgWidth - paddingX} y2={20} />
                    <line x1={paddingX} y1={120} x2={svgWidth - paddingX} y2={120} />
                    <line x1={paddingX} y1={220} x2={svgWidth - paddingX} y2={220} />
                  </g>

                  {/* Area path with gradient */}
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6500" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#FF6500" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>
                  {areaD && <path d={areaD} fill="url(#areaGrad)" />}

                  {/* Line path */}
                  {lineD && (
                    <path
                      d={lineD}
                      fill="none"
                      stroke="#FF6500"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Grid vertical hover lines & dots */}
                  {points.map((p, i) => {
                    const isHovered = hoveredIndex === i
                    return (
                      <g key={i}>
                        {/* Vertical hover guide line */}
                        {isHovered && (
                          <line
                            x1={p.x}
                            y1={chartPadT}
                            x2={p.x}
                            y2={baselineY}
                            stroke="#FF6500"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                          />
                        )}

                        {/* Axis Labels (Period) */}
                        <text
                          x={p.x}
                          y={svgHeight - 10}
                          fill="#A1B5CC"
                          fontSize="9"
                          fontFamily="JetBrains Mono, monospace"
                          textAnchor="middle"
                          opacity={isHovered ? 1 : 0.6}
                          className="transition-opacity"
                        >
                          {p.semana}
                        </text>

                        {/* Y Axis rates on the line dots */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? 6 : 4}
                          fill={isHovered ? '#FF6500' : '#0B192C'}
                          stroke="#FF6500"
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          className="transition-all duration-150"
                        />
                      </g>
                    )
                  })}

                  {/* Mouse capture columns */}
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

                {chartData.length === 1 && (
                  <p className="text-[#A1B5CC] text-xs text-center mt-4 font-sans">
                    Adicione mais leads para ver a evolução semanal
                  </p>
                )}

                {/* Custom Tooltip */}
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
            )}
          </div>
        </>
      </main>
    </div>
  )
}
