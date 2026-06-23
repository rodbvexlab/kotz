import { useState } from 'react'
import { useTenant } from '@/lib/tenant'
import { useDashboardMetrics } from './hooks/useDashboardMetrics'
import { useChartData } from './hooks/useChartData'
import { AppNav } from '@/components/layout/AppNav'
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard'

// ─── Design System §5 — MetricCard accent per card ────────────────────────────
const CARDS = [
  {
    id:         'leads',
    label:      'LEADS ATIVOS',
    accent:     '#4A7FA5',
    sparkColor: 'rgba(74,127,165,0.7)',
    key:        'total_leads',
  },
  {
    id:         'propostas',
    label:      'PROPOSTAS ENVIADAS',
    accent:     'rgba(255,101,0,0.75)',
    sparkColor: 'rgba(255,101,0,0.65)',
    key:        'total_propostas',
  },
  {
    id:         'fechados',
    label:      'FECHADOS NO MÊS',
    accent:     '#FF6500',
    sparkColor: '#FF6500',
    key:        'fechados_mes',
  },
] as const

// § 5 Sparkline — cubic bezier, no straight lines
const SPARKLINE_PATH = 'M0,20 C30,19 60,16 90,13 C120,10 150,7 180,4'
const SPARKLINE_AREA = 'M0,20 C30,19 60,16 90,13 C120,10 150,7 180,4 L180,24 L0,24 Z'

export function DashboardPage() {
  const { tenant } = useTenant()
  const { metrics, loading } = useDashboardMetrics()
  const { data: chartData, loading: chartLoading } = useChartData()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const tenantName = (tenant?.name ?? '').replace(/\b\w/g, c => c.toUpperCase())

  const displayMetrics = metrics ?? {
    total_leads:     0,
    total_propostas: 0,
    fechados_mes:    0,
    taxa_conversao:  0,
  }

  // ─── SVG chart config ────────────────────────────────────────────────────────
  const svgWidth   = 600
  const svgHeight  = 250
  const paddingX   = 40
  const chartWidth = svgWidth - paddingX * 2
  const chartH     = 200
  const chartPadT  = 20
  const baselineY  = chartPadT + chartH

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

  // § 5 Gráfico Pipeline — cubic bezier smooth path
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

  // ─── § 8 Loading state — transparente para o body respirar ───────────────────
  if (loading) {
    return (
      <div style={{
        minHeight:      '100vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        <div className="ds-spinner" />
      </div>
    )
  }

  return (
    <div style={{
      position:      'relative',
      minHeight:     '100vh',
      color:         'white',
      display:       'flex',
      flexDirection: 'column',
      fontFamily:    'Inter, system-ui, sans-serif',
    }}>
      <AppNav />

      <main style={{
        flex:          1,
        padding:       '24px',
        maxWidth:      '1200px',
        width:         '100%',
        margin:        '0 auto',
        display:       'flex',
        flexDirection: 'column',
        gap:           '24px',
      }}>

        {/* ─── Page heading ─────────────────────────────────────────────────── */}
        <div>
          <h1 style={{
            fontSize:      '28px',
            fontWeight:    700,
            letterSpacing: '-1px',
            color:         'white',
            margin:        0,
          }}>
            {tenantName ? `Olá, ${tenantName}` : 'Dashboard'}
          </h1>
          <p style={{ fontSize: '14px', color: '#A1B5CC', marginTop: '4px' }}>
            Visão geral do seu funil de prospecção
          </p>
        </div>

        {/* ─── § 5 MetricCards — glass-metric, 3 colunas ─────────────────── */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap:                 '16px',
        }}>
          {CARDS.map(({ id, label, accent, sparkColor, key }) => (
            <LiquidGlassCard
              key={id}
              style={{
                borderLeft: `3px solid ${accent}`,
                padding:    '22px 24px',
              }}
            >
              {/* Label: UPPERCASE 11px #A1B5CC letter-spacing 0.12em weight-600 */}
              <p style={{
                fontSize:      '11px',
                fontWeight:    600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         '#A1B5CC',
                margin:        '0 0 10px 0',
              }}>
                {label}
              </p>

              {/* Número: 60px weight-900 Inter white letter-spacing:-2px */}
              <p style={{
                fontSize:      '60px',
                fontWeight:    900,
                lineHeight:    1,
                fontFamily:    'Inter, sans-serif',
                color:         'white',
                letterSpacing: '-2px',
                margin:        '0 0 14px 0',
              }}>
                {displayMetrics[key]}
              </p>

              {/* § 5 Sparkline — cubic bezier, area 0.22, line 0.55, sem eixos */}
              <svg width="100%" height="24" viewBox="0 0 180 24" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={sparkColor} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={sparkColor} stopOpacity="0"    />
                  </linearGradient>
                </defs>
                <path d={SPARKLINE_AREA} fill={`url(#sg-${id})`} />
                <path
                  d={SPARKLINE_PATH}
                  fill="none"
                  stroke={sparkColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              </svg>
            </LiquidGlassCard>
          ))}
        </div>

        {/* ─── § 5 Gráfico Pipeline — glass-metric, padding 24px ─────────── */}
        <LiquidGlassCard
          style={{
            padding:  '24px',
            position: 'relative',
          }}
        >
          {/* Header do gráfico */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginBottom:   '20px',
          }}>
            <div>
              {/* Título: 16px weight-600 white */}
              <h2 style={{
                fontSize:      '16px',
                fontWeight:    600,
                color:         'white',
                margin:        0,
                letterSpacing: '-0.3px',
              }}>
                Evolução do Pipeline
              </h2>
              {/* Subtítulo: 12px #A1B5CC */}
              <p style={{ fontSize: '12px', color: '#A1B5CC', margin: '4px 0 0 0' }}>
                Leads criados por semana de prospecção
              </p>
            </div>

            {/* Legenda */}
            <div style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '6px',
              fontSize:   '11px',
              fontFamily: 'JetBrains Mono, monospace',
              color:      '#A1B5CC',
            }}>
              <span style={{
                width:        '8px',
                height:       '8px',
                borderRadius: '50%',
                background:   'linear-gradient(135deg, #FF6500, #e85500)',
                display:      'inline-block',
                boxShadow:    '0 0 6px rgba(255,101,0,0.40)',
              }} />
              <span style={{ color: 'white' }}>Leads Criados</span>
            </div>
          </div>

          {/* ── Chart body ── */}
          {chartLoading ? (
            <div style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              minHeight:      '220px',
              gap:            '12px',
            }}>
              <div className="ds-spinner" />
              <p style={{
                fontSize:   '10px',
                fontFamily: 'JetBrains Mono, monospace',
                color:      'rgba(161,181,204,0.6)',
              }}>
                Carregando dados do gráfico...
              </p>
            </div>
          ) : hasEnoughData ? (
            // § 5 — exibir SOMENTE quando chartData.length > 1
            <div style={{ position: 'relative', width: '100%', overflowX: 'auto', minHeight: '220px' }}>
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{ width: '100%', minWidth: '500px', height: 'auto', display: 'block', userSelect: 'none' }}
              >
                {/* Grid: 3 linhas horizontais rgba(30,62,98,0.20) */}
                <g stroke="rgba(30,62,98,0.20)" strokeWidth="1">
                  <line x1={paddingX} y1={chartPadT}                  x2={svgWidth - paddingX} y2={chartPadT}                  />
                  <line x1={paddingX} y1={chartPadT + chartH / 2}     x2={svgWidth - paddingX} y2={chartPadT + chartH / 2}     />
                  <line x1={paddingX} y1={baselineY}                   x2={svgWidth - paddingX} y2={baselineY}                   />
                </g>

                <defs>
                  {/* Área: gradiente #FF6500 → transparente opacity 0.15 */}
                  <linearGradient id="pipelineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#FF6500" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#FF6500" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {areaD && <path d={areaD} fill="url(#pipelineAreaGrad)" />}
                {/* Linha: #FF6500 strokeWidth 2 rounded */}
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
                      {/* Dashed crosshair on hover */}
                      {isHovered && (
                        <line
                          x1={p.x} y1={chartPadT} x2={p.x} y2={baselineY}
                          stroke="rgba(255,101,0,0.30)"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                      )}
                      {/* Labels eixo X: 11px JetBrains Mono #A1B5CC opacity 0.6 */}
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
                      {/* Data point dot — hover: filled + glow */}
                      <circle
                        cx={p.x} cy={p.y}
                        r={isHovered ? 5 : 3}
                        fill={isHovered ? '#FF6500' : 'rgba(8,12,20,0.9)'}
                        stroke="#FF6500"
                        strokeWidth={isHovered ? 2 : 1.5}
                        style={{ transition: 'all 150ms ease', filter: isHovered ? 'drop-shadow(0 0 4px rgba(255,101,0,0.6))' : 'none' }}
                      />
                    </g>
                  )
                })}

                {/* Invisible hover hit areas */}
                {points.map((p, i) => (
                  <rect
                    key={i}
                    x={p.x - chartWidth / (chartData.length - 1 || 1) / 2}
                    y={chartPadT}
                    width={chartWidth / (chartData.length - 1 || 1)}
                    height={chartH}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ))}
              </svg>

              {/* § 5 Tooltip: glass-card mini — NOT rgba(11,25,44,X) */}
              {hoveredIndex !== null && points[hoveredIndex] && (
                <div
                  style={{
                    position:             'absolute',
                    pointerEvents:        'none',
                    background:           'rgba(8, 12, 20, 0.90)',
                    backdropFilter:       'blur(20px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                    border:               '1px solid rgba(255, 255, 255, 0.10)',
                    borderRadius:         '8px',
                    boxShadow:            '0 4px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
                    padding:              '8px 12px',
                    fontSize:             '11px',
                    fontFamily:           'JetBrains Mono, monospace',
                    zIndex:               20,
                    left:                 `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                    top:                  `${(points[hoveredIndex].y / svgHeight) * 100 - 15}%`,
                    transform:            'translate(-50%, -100%)',
                    display:              'flex',
                    flexDirection:        'column',
                    gap:                  '3px',
                    minWidth:             '110px',
                  }}
                >
                  <span style={{ fontSize: '9px', color: 'rgba(161,181,204,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {points[hoveredIndex].semana}
                  </span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '12px' }}>
                    Leads: <span style={{ color: '#FF6500' }}>{points[hoveredIndex].leads_criados}</span>
                  </span>
                  <span style={{ color: '#A1B5CC', fontSize: '10px' }}>
                    Propostas: {points[hoveredIndex].propostas}
                  </span>
                  <span style={{ color: '#A1B5CC', fontSize: '10px' }}>
                    Fechados: {points[hoveredIndex].fechados}
                  </span>
                </div>
              )}
            </div>
          ) : (
            // § 5 — ≤1 ponto: empty state ultra-sutil com CTA para Pipeline
            <div style={{
              borderRadius: '12px',
              padding:      '48px 32px',
              textAlign:    'center',
              background:   'rgba(255,255,255,0.01)',
              border:       '1px solid rgba(255,255,255,0.04)',
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}>
                <path
                  d="M4 24 L10 16 L16 18 L22 10 L28 8"
                  stroke="rgba(30,62,98,0.45)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="28" cy="8" r="2" fill="rgba(30,62,98,0.45)" />
              </svg>
              <p style={{ color: 'rgba(255,255,255,0.50)', fontWeight: 600, margin: '0 0 6px 0', fontSize: '14px' }}>
                Sem dados suficientes
              </p>
              <p style={{ color: '#A1B5CC', fontSize: '13px', margin: '0 0 16px 0' }}>
                Crie mais leads para ver a evolução semanal.
              </p>
              <a
                href="/pipeline"
                style={{
                  color:          '#FF6500',
                  fontSize:       '13px',
                  fontWeight:     500,
                  textDecoration: 'none',
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            '4px',
                  transition:     'opacity 150ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Ir para o Pipeline →
              </a>
            </div>
          )}
        </LiquidGlassCard>

      </main>
    </div>
  )
}
