import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { useTenant } from '@/lib/tenant'
import { 
  TrendingUp, 
  Send, 
  CheckCircle2, 
  LayoutGrid, 
  LogOut, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export interface DashboardMetrics {
  leadsAtivosCount: number
  leadsAtivosTrend: number
  propostasEnviadasCount: number
  propostasEnviadasTrend: number
  fechadosMesCount: number
  fechadosMesTrend: number
  conversionData: {
    period: string
    rate: number
    leads: number
  }[]
}

export interface DashboardPageProps {
  metrics?: DashboardMetrics
}

const DEFAULT_METRICS: DashboardMetrics = {
  leadsAtivosCount: 24,
  leadsAtivosTrend: 12,
  propostasEnviadasCount: 15,
  propostasEnviadasTrend: -3,
  fechadosMesCount: 8,
  fechadosMesTrend: 18,
  conversionData: [
    { period: 'Semana 1', rate: 10, leads: 3 },
    { period: 'Semana 2', rate: 14, leads: 5 },
    { period: 'Semana 3', rate: 18, leads: 8 },
    { period: 'Semana 4', rate: 15, leads: 7 },
    { period: 'Semana 5', rate: 22, leads: 11 },
    { period: 'Semana 6', rate: 28, leads: 15 },
  ]
}

export function DashboardPage({ metrics = DEFAULT_METRICS }: DashboardPageProps) {
  const { user, signOut } = useAuth()
  const { tenant } = useTenant()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const maxRate = Math.max(...metrics.conversionData.map(d => d.rate), 30)

  // Configurações do SVG
  const svgWidth = 600
  const svgHeight = 220
  const paddingX = 40
  const paddingY = 30
  const chartWidth = svgWidth - paddingX * 2
  const chartHeight = svgHeight - paddingY * 2

  // Gera pontos do gráfico
  const points = metrics.conversionData.map((d, i) => {
    const x = paddingX + (i / (metrics.conversionData.length - 1)) * chartWidth
    const y = svgHeight - paddingY - (d.rate / maxRate) * chartHeight
    return { x, y, ...d }
  })

  // Constroi string do path do gráfico de linha
  const lineD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, '')

  // Constroi string do path do gráfico de área
  const areaD = points.length > 0 
    ? `${lineD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : ''

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#FF6500] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#1E3E62]/30 px-6 py-4 flex items-center justify-between shrink-0 bg-[#0B192C]/40 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Ko</span>
            <span className="text-[#FF6500]">tz</span>
          </span>
          <div className="h-4 w-px bg-[#1E3E62]/30" />
          <nav className="flex items-center gap-1.5">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm text-white px-3 py-1.5 rounded-lg bg-[#1E3E62]/30 font-medium transition-all"
            >
              <BarChart3 size={14} className="text-[#FF6500]" />
              Dashboard
            </Link>
            <Link
              to="/pipeline"
              className="flex items-center gap-1.5 text-sm text-[#A1B5CC] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#1E3E62]/20 transition-all"
            >
              <LayoutGrid size={14} />
              Pipeline
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {tenant && (
            <span className="text-[#A1B5CC] text-xs font-mono bg-[#1E3E62]/20 px-2.5 py-1 rounded-md border border-[#1E3E62]/30">
              {tenant.name}
            </span>
          )}
          <div className="h-4 w-px bg-[#1E3E62]/30" />
          <span className="text-[#A1B5CC] text-xs font-mono max-sm:hidden">{user?.email}</span>
          <button
            onClick={signOut}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A1B5CC] hover:text-white hover:bg-[#1E3E62]/20 transition-all"
            title="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Olá{tenant ? `, ${tenant.name}` : ''} 👋
          </h1>
          <p className="text-sm text-[#A1B5CC] mt-1">
            Aqui está o desempenho dos leads da sua agência criativa para este período.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Leads Ativos */}
          <div className="bg-[#0B192C] border border-[#1E3E62]/30 rounded-xl p-6 shadow-md hover:border-[#1E3E62]/60 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1E3E62] group-hover:bg-[#FF6500] transition-colors" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#A1B5CC] uppercase">Leads Ativos</p>
                <p className="text-4xl font-bold font-mono text-white mt-3 tracking-tight">
                  {metrics.leadsAtivosCount}
                </p>
              </div>
              <div className="p-3 bg-[#1E3E62]/20 rounded-lg text-[#A1B5CC] group-hover:text-white transition-colors">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs font-mono">
              {metrics.leadsAtivosTrend >= 0 ? (
                <span className="flex items-center text-emerald-400 font-medium">
                  <ArrowUpRight size={14} />
                  +{metrics.leadsAtivosTrend}%
                </span>
              ) : (
                <span className="flex items-center text-rose-400 font-medium">
                  <ArrowDownRight size={14} />
                  {metrics.leadsAtivosTrend}%
                </span>
              )}
              <span className="text-[#A1B5CC]/60">vs. semana anterior</span>
            </div>
          </div>

          {/* Card 2: Propostas Enviadas */}
          <div className="bg-[#0B192C] border border-[#1E3E62]/30 rounded-xl p-6 shadow-md hover:border-[#1E3E62]/60 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1E3E62] group-hover:bg-[#FF6500] transition-colors" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#A1B5CC] uppercase">Propostas Enviadas</p>
                <p className="text-4xl font-bold font-mono text-white mt-3 tracking-tight">
                  {metrics.propostasEnviadasCount}
                </p>
              </div>
              <div className="p-3 bg-[#1E3E62]/20 rounded-lg text-[#A1B5CC] group-hover:text-white transition-colors">
                <Send size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs font-mono">
              {metrics.propostasEnviadasTrend >= 0 ? (
                <span className="flex items-center text-emerald-400 font-medium">
                  <ArrowUpRight size={14} />
                  +{metrics.propostasEnviadasTrend}%
                </span>
              ) : (
                <span className="flex items-center text-rose-400 font-medium">
                  <ArrowDownRight size={14} />
                  {metrics.propostasEnviadasTrend}%
                </span>
              )}
              <span className="text-[#A1B5CC]/60">vs. semana anterior</span>
            </div>
          </div>

          {/* Card 3: Fechados no Mês */}
          <div className="bg-[#0B192C] border border-[#FF6500]/20 hover:border-[#FF6500]/40 rounded-xl p-6 shadow-md shadow-[#FF6500]/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF6500]" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#A1B5CC] uppercase">Fechados no Mês</p>
                <p className="text-4xl font-bold font-mono text-white mt-3 tracking-tight">
                  {metrics.fechadosMesCount}
                </p>
              </div>
              <div className="p-3 bg-[#FF6500]/10 rounded-lg text-[#FF6500]">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs font-mono">
              {metrics.fechadosMesTrend >= 0 ? (
                <span className="flex items-center text-emerald-400 font-medium">
                  <ArrowUpRight size={14} />
                  +{metrics.fechadosMesTrend}%
                </span>
              ) : (
                <span className="flex items-center text-rose-400 font-medium">
                  <ArrowDownRight size={14} />
                  {metrics.fechadosMesTrend}%
                </span>
              )}
              <span className="text-[#A1B5CC]/60">vs. meta do período</span>
            </div>
          </div>
        </div>

        {/* SVG Area Chart Container */}
        <div className="bg-[#0B192C] border border-[#1E3E62]/30 rounded-xl p-6 shadow-md relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Conversão de Leads</h2>
              <p className="text-xs text-[#A1B5CC] mt-0.5">Taxa percentual de conversão e leads captados</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6500]" />
                <span className="text-white">% Taxa</span>
              </div>
            </div>
          </div>

          {/* SVG Area Chart wrapper */}
          <div className="relative w-full overflow-x-auto min-h-[220px]">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full min-w-[500px] h-auto block select-none"
            >
              {/* Grids and Axes */}
              <g stroke="#1E3E62" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3">
                {Array.from({ length: 4 }).map((_, i) => {
                  const yVal = paddingY + (i / 3) * chartHeight
                  return <line key={i} x1={paddingX} y1={yVal} x2={svgWidth - paddingX} y2={yVal} />
                })}
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
                        y1={paddingY} 
                        x2={p.x} 
                        y2={svgHeight - paddingY} 
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
                      {p.period}
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
                  x={p.x - chartWidth / (metrics.conversionData.length - 1) / 2}
                  y={paddingY}
                  width={chartWidth / (metrics.conversionData.length - 1)}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </svg>

            {/* Custom Tooltip */}
            {hoveredIndex !== null && (
              <div
                className="absolute pointer-events-none bg-[#0B192C] border border-[#1E3E62]/60 px-3 py-2 rounded-lg shadow-xl text-xs flex flex-col font-mono z-20 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                  top: `${(points[hoveredIndex].y / svgHeight) * 100 - 15}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <span className="text-[#A1B5CC]/70 text-[9px] uppercase tracking-wider">
                  {points[hoveredIndex].period}
                </span>
                <span className="text-white font-bold mt-0.5">
                  Taxa: <span className="text-[#FF6500] font-bold">{points[hoveredIndex].rate}%</span>
                </span>
                <span className="text-[#A1B5CC] text-[10px] mt-0.5">
                  Volume: {points[hoveredIndex].leads} leads
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

