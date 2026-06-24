import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Check, Eye, Clock } from 'lucide-react'
import type { Proposal, WorkspaceSettings } from '@/types/database'
import { getProposalBySlug, incrementProposalView, acceptProposal } from './hooks/useProposals'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))
}

// ── Confetti particles via Framer Motion ────────────────────────────────────

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  delay: number
}

function ConfettiExplosion({ originY }: { originY: number }) {
  const colors = ['#FF6500', '#F59E0B', '#22C55E', '#60A5FA', '#F472B6', '#A78BFA', '#FFFFFF']

  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 700,
      y: -(Math.random() * 500 + 100),
      rotation: Math.random() * 720 - 360,
      color: colors[i % colors.length],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.3,
    })),
  [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{ perspective: '800px' }}
    >
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{
            opacity: 1,
            x: '50%',
            y: originY,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            opacity: [1, 1, 0],
            x: `calc(50% + ${p.x}px)`,
            y: originY + p.y + 800,
            scale: [0, 1.2, 0.8],
            rotate: p.rotation,
          }}
          transition={{
            duration: 2.2,
            delay: p.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size * 0.6,
            borderRadius: '2px',
            background: p.color,
            left: 0,
            top: 0,
          }}
        />
      ))}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

export function ProposalPublicPage() {
  const { slug } = useParams<{ slug: string }>()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiOrigin, setConfettiOrigin] = useState(0)

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return }

    getProposalBySlug(slug).then(result => {
      if (!result) { setNotFound(true); setLoading(false); return }
      setProposal(result.proposal)
      setSettings(result.settings)
      if (result.proposal.status === 'accepted') setAccepted(true)
      setLoading(false)
      incrementProposalView(slug)
    })
  }, [slug])

  const handleAccept = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!slug || accepted || accepting) return
    setAccepting(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setConfettiOrigin(rect.top + rect.height / 2)

    const result = await acceptProposal(slug)
    if (result.success) {
      setAccepted(true)
      setShowConfetti(true)
      setProposal(prev => prev ? { ...prev, status: 'accepted' } : prev)
      setTimeout(() => setShowConfetti(false), 3000)
    }
    setAccepting(false)
  }, [slug, accepted, accepting])

  const template = settings?.proposal_template ?? 'dark'
  const primaryColor = settings?.primary_color ?? '#FF6500'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: template === 'light' ? '#ffffff' : '#080c14' }}>
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{
            borderColor: template === 'light' ? 'rgba(0,0,0,0.10)' : 'rgba(255,101,0,0.20)',
            borderTopColor: primaryColor,
          }}
        />
      </div>
    )
  }

  if (notFound || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: template === 'light' ? '#ffffff' : '#080c14' }}>
        <div className="text-center">
          <p style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', color: template === 'light' ? '#111' : '#fff' }}>
            404
          </p>
          <p style={{ fontSize: '14px', color: template === 'light' ? '#666' : '#A1B5CC', marginTop: '8px' }}>
            Proposta não encontrada.
          </p>
        </div>
      </div>
    )
  }

  if (template === 'light') {
    return <LightTemplate proposal={proposal} settings={settings} primaryColor={primaryColor} accepted={accepted} accepting={accepting} onAccept={handleAccept} showConfetti={showConfetti} confettiOrigin={confettiOrigin} />
  }

  return <DarkTemplate proposal={proposal} settings={settings} primaryColor={primaryColor} accepted={accepted} accepting={accepting} onAccept={handleAccept} showConfetti={showConfetti} confettiOrigin={confettiOrigin} />
}

// ── Template props ──────────────────────────────────────────────────────────

interface TemplateProps {
  proposal: Proposal
  settings: WorkspaceSettings | null
  primaryColor: string
  accepted: boolean
  accepting: boolean
  onAccept: (e: React.MouseEvent<HTMLButtonElement>) => void
  showConfetti: boolean
  confettiOrigin: number
}

// ── Light Template ──────────────────────────────────────────────────────────

function LightTemplate({ proposal, settings, primaryColor, accepted, accepting, onAccept, showConfetti, confettiOrigin }: TemplateProps) {
  const isExpired = proposal.valid_until && new Date(proposal.valid_until) < new Date()

  return (
    <div className="min-h-screen" style={{ background: '#ffffff', '--primary': primaryColor } as React.CSSProperties}>
      <AnimatePresence>{showConfetti && <ConfettiExplosion originY={confettiOrigin} />}</AnimatePresence>

      <div className="max-w-[680px] mx-auto px-6 py-16">
        {/* Logo */}
        {settings?.logo_url && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-12"
          >
            <img src={settings.logo_url} alt="Logo" className="h-10 object-contain" />
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1.5px', color: '#111', lineHeight: 1.2 }}
        >
          {proposal.title}
        </motion.h1>

        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 mt-4 mb-10"
        >
          {proposal.valid_until && (
            <span className="flex items-center gap-1.5 text-[13px]" style={{ color: '#888' }}>
              <Clock size={13} />
              Válida até {formatDate(proposal.valid_until)}
            </span>
          )}
          {proposal.viewed_count > 0 && (
            <span className="flex items-center gap-1.5 text-[13px]" style={{ color: '#888' }}>
              <Eye size={13} />
              {proposal.viewed_count} {proposal.viewed_count === 1 ? 'visualização' : 'visualizações'}
            </span>
          )}
        </motion.div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#eee', margin: '0 0 32px' }} />

        {/* Scope */}
        {proposal.scope && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-10"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#999' }}>
              Escopo do Projeto
            </p>
            <div
              className="text-[15px] leading-relaxed whitespace-pre-wrap"
              style={{ color: '#333', fontFamily: 'Inter, sans-serif' }}
            >
              {proposal.scope}
            </div>
          </motion.div>
        )}

        {/* Value */}
        {proposal.value != null && proposal.value > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 p-6 rounded-2xl text-center"
            style={{ background: '#f8f8f8', border: '1px solid #eee' }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#999' }}>
              Investimento
            </p>
            <p style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-2px', color: primaryColor, fontFamily: 'Inter, sans-serif' }}>
              {formatCurrency(proposal.value)}
            </p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          {accepted ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.10)' }}>
                <Check size={28} style={{ color: '#22C55E' }} />
              </div>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#111' }}>Proposta aceita!</p>
              <p style={{ fontSize: '14px', color: '#888' }}>Entraremos em contato em breve.</p>
            </div>
          ) : isExpired ? (
            <p style={{ fontSize: '14px', color: '#999' }}>Esta proposta expirou.</p>
          ) : (
            <button
              onClick={onAccept}
              disabled={accepting}
              className="inline-flex items-center gap-2 text-[15px] font-semibold text-white transition-all duration-200 disabled:opacity-60 cursor-pointer active:scale-[0.97]"
              style={{
                background: primaryColor,
                padding: '14px 40px',
                borderRadius: '12px',
                border: 'none',
                boxShadow: `0 4px 16px ${primaryColor}40`,
              }}
            >
              {accepting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={18} />
              )}
              Aceitar Proposta
            </button>
          )}
        </motion.div>

        {/* Footer */}
        {settings?.footer_text && (
          <p className="text-center mt-16 text-[12px]" style={{ color: '#bbb' }}>
            {settings.footer_text}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Dark Template (Kotz Immersive) ──────────────────────────────────────────

function DarkTemplate({ proposal, settings, primaryColor, accepted, accepting, onAccept, showConfetti, confettiOrigin }: TemplateProps) {
  const isExpired = proposal.valid_until && new Date(proposal.valid_until) < new Date()

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#080c14',
        '--primary': primaryColor,
        backgroundImage: `
          radial-gradient(ellipse 70% 50% at 15% 35%, rgba(30,62,98,0.22) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 85% 15%, rgba(30,62,98,0.14) 0%, transparent 55%),
          radial-gradient(ellipse 40% 55% at 50% 85%, rgba(11,25,44,0.35) 0%, transparent 65%)
        `,
      } as React.CSSProperties}
    >
      <AnimatePresence>{showConfetti && <ConfettiExplosion originY={confettiOrigin} />}</AnimatePresence>

      <div className="max-w-[680px] mx-auto px-6 py-16">
        {/* Logo */}
        {settings?.logo_url ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-12"
          >
            <img src={settings.logo_url} alt="Logo" className="h-10 object-contain" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-12"
          >
            <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>
              Ko<span style={{ color: primaryColor }}>tz</span>
            </span>
          </motion.div>
        )}

        {/* Glass card container */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <h1
              style={{
                fontSize: '28px', fontWeight: 800, letterSpacing: '-1px',
                color: '#ffffff', lineHeight: 1.2, fontFamily: 'Inter, sans-serif',
              }}
            >
              {proposal.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3">
              {proposal.valid_until && (
                <span className="flex items-center gap-1.5 text-[12px] font-mono" style={{ color: '#A1B5CC' }}>
                  <Clock size={12} />
                  Válida até {formatDate(proposal.valid_until)}
                </span>
              )}
              {proposal.viewed_count > 0 && (
                <span className="flex items-center gap-1.5 text-[12px] font-mono" style={{ color: '#A1B5CC' }}>
                  <Eye size={12} />
                  {proposal.viewed_count}x
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          {/* Scope */}
          {proposal.scope && (
            <div className="px-8 py-6">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-3"
                style={{ color: '#A1B5CC' }}
              >
                Escopo do Projeto
              </p>
              <div
                className="text-[14px] leading-relaxed whitespace-pre-wrap"
                style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif' }}
              >
                {proposal.scope}
              </div>
            </div>
          )}

          {/* Value */}
          {proposal.value != null && proposal.value > 0 && (
            <div className="px-8 py-6">
              <div
                className="rounded-xl p-6 text-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#A1B5CC' }}>
                  Investimento
                </p>
                <p style={{
                  fontSize: '42px', fontWeight: 900, letterSpacing: '-2px',
                  color: primaryColor, fontFamily: 'Inter, sans-serif',
                }}>
                  {formatCurrency(proposal.value)}
                </p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          {/* CTA */}
          <div className="px-8 py-8 text-center">
            {accepted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
                >
                  <Check size={28} style={{ color: '#22C55E' }} />
                </div>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>Proposta aceita!</p>
                <p style={{ fontSize: '14px', color: '#A1B5CC' }}>Entraremos em contato em breve.</p>
              </motion.div>
            ) : isExpired ? (
              <p style={{ fontSize: '14px', color: '#A1B5CC' }}>Esta proposta expirou.</p>
            ) : (
              <button
                onClick={onAccept}
                disabled={accepting}
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-white transition-all duration-200 disabled:opacity-60 cursor-pointer active:scale-[0.97]"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                  padding: '14px 40px',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: `0 4px 16px ${primaryColor}40, inset 0 1px 0 rgba(255,255,255,0.15)`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 24px ${primaryColor}60, inset 0 1px 0 rgba(255,255,255,0.20)`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${primaryColor}40, inset 0 1px 0 rgba(255,255,255,0.15)`
                }}
              >
                {accepting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                Aceitar Proposta
              </button>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <p
          className="text-center mt-10 text-[11px] font-mono"
          style={{ color: 'rgba(161,181,204,0.4)' }}
        >
          {settings?.footer_text || 'Powered by Kotz'}
        </p>
      </div>
    </div>
  )
}
