import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  X, Instagram, MessageCircle, Users, Calendar,
  PlusCircle, Sparkles, Edit2, Check, Loader2,
  ChevronDown, Phone,
} from 'lucide-react'
import type { Lead, LeadStatus, LeadChannel } from '@/types/pipeline'
import type { LeadInteraction } from '@/types/database'
import { GlassCard } from '@/components/ui/GlassCard'
import { useUpdateLead, type UpdateLeadPayload } from '../hooks/useUpdateLead'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeadPanelProps {
  lead: Lead | null
  onClose: () => void
  interactions: LeadInteraction[]
  loadingInteractions: boolean
  onAddInteraction: (note: string) => Promise<void>
  onUpdateLead: (updated: Lead) => void
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CHANNEL_META: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string; border: string }> = {
  instagram: {
    icon: <Instagram size={11} />,
    label: 'Instagram',
    color: '#F472B6',
    bg: 'rgba(244,114,182,0.06)',
    border: 'rgba(244,114,182,0.18)',
  },
  whatsapp: {
    icon: <MessageCircle size={11} />,
    label: 'WhatsApp',
    color: '#4ADE80',
    bg: 'rgba(74,222,128,0.06)',
    border: 'rgba(74,222,128,0.18)',
  },
  indicacao: {
    icon: <Users size={11} />,
    label: 'Indicação',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.06)',
    border: 'rgba(96,165,250,0.18)',
  },
  outro: {
    icon: null,
    label: 'Outro',
    color: '#A1B5CC',
    bg: 'rgba(30,62,98,0.12)',
    border: 'rgba(30,62,98,0.25)',
  },
}

const STATUS_META: Record<LeadStatus, { label: string; color: string; bg: string; border: string }> = {
  novo:             { label: 'Novo',             color: '#A1B5CC', bg: 'rgba(30,62,98,0.12)',     border: 'rgba(30,62,98,0.30)'     },
  em_contato:       { label: 'Em contato',       color: '#FF6500', bg: 'rgba(255,101,0,0.08)',   border: 'rgba(255,101,0,0.25)'   },
  proposta_enviada: { label: 'Proposta enviada', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  fechado:          { label: 'Fechado',          color: '#22C55E', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)'   },
  perdido:          { label: 'Perdido',          color: '#52525B', bg: 'rgba(82,82,91,0.12)',    border: 'rgba(82,82,91,0.25)'    },
}

const ALL_STATUSES = Object.keys(STATUS_META) as LeadStatus[]
const ALL_CHANNELS: (LeadChannel | null)[] = ['instagram', 'whatsapp', 'indicacao', 'outro', null]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toForm(lead: Lead): UpdateLeadPayload {
  return {
    name:    lead.name,
    service: lead.service,
    channel: lead.channel,
    contact: lead.contact,
    notes:   lead.notes,
    status:  lead.status,
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

function formatInteractionDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Input padronizado com estilo dark-luxury do design system §5 */
function DSInput({
  label, value, onChange, placeholder, required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#A1B5CC',
        }}
      >
        {label}{required && <span style={{ color: '#FF6500', marginLeft: '3px' }}>*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          fontSize: '13px',
          color: '#ffffff',
          background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
          border: focused
            ? '1px solid rgba(255, 101, 0, 0.45)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: focused
            ? '0 0 0 3px rgba(255,101,0,0.08), inset 0 1px 0 rgba(255,255,255,0.04)'
            : 'inset 0 1px 0 rgba(255,255,255,0.03)',
          borderRadius: '8px',
          padding: '9px 12px',
          outline: 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease, background 150ms ease',
          fontFamily: 'Inter, sans-serif',
        }}
        className="placeholder:text-[#A1B5CC]/30"
      />
    </div>
  )
}

/** Textarea padronizada */
function DSTextarea({
  label, value, onChange, placeholder, rows = 4,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#A1B5CC',
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          fontSize: '13px',
          color: '#ffffff',
          background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
          border: focused
            ? '1px solid rgba(255, 101, 0, 0.45)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: focused
            ? '0 0 0 3px rgba(255,101,0,0.08), inset 0 1px 0 rgba(255,255,255,0.04)'
            : 'inset 0 1px 0 rgba(255,255,255,0.03)',
          borderRadius: '8px',
          padding: '9px 12px',
          outline: 'none',
          resize: 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease, background 150ms ease',
          fontFamily: 'Inter, sans-serif',
        }}
        className="placeholder:text-[#A1B5CC]/30"
      />
    </div>
  )
}

/** Dropdown de Status customizado — glass, click-outside, sem <select> nativo */
function StatusDropdown({
  value, onChange,
}: {
  value: LeadStatus
  onChange: (v: LeadStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const meta = STATUS_META[value]

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <label className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-widest">
        Status<span className="text-[#FF6500] ml-0.5">*</span>
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border text-[13px] font-medium cursor-pointer transition-all duration-150 hover:brightness-110"
        style={{
          background:  meta.bg,
          borderColor: meta.border,
          color:       meta.color,
        }}
      >
        <span className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: meta.color }}
          />
          {meta.label}
        </span>
        <ChevronDown
          size={14}
          className={`text-current opacity-60 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menu glass */}
      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-2xl"
          style={{
            background:     'rgba(8, 12, 20, 0.96)',
            backdropFilter: 'blur(20px) saturate(160%)',
            border:         '1px solid rgba(255,255,255,0.09)',
            boxShadow:      '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {ALL_STATUSES.map(s => {
            const m = STATUS_META[s]
            const isSelected = s === value
            return (
              <button
                key={s}
                type="button"
                onClick={() => { onChange(s); setOpen(false) }}
                className="flex items-center justify-between w-full px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-100 hover:bg-white/[0.05]"
                style={{ color: m.color }}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: m.color }}
                  />
                  {m.label}
                </span>
                {isSelected && <Check size={13} className="text-[#FF6500]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Dropdown de Canal customizado — permite null (sem canal) */
function ChannelDropdown({
  value, onChange,
}: {
  value: LeadChannel | null
  onChange: (v: LeadChannel | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const meta = value ? CHANNEL_META[value] : null

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <label className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-widest">
        Canal de Origem
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border text-[13px] font-medium cursor-pointer transition-all duration-150 hover:border-white/15"
        style={{
          background:  meta ? meta.bg   : 'rgba(0,0,0,0.35)',
          borderColor: meta ? meta.border : 'rgba(255,255,255,0.08)',
          color:       meta ? meta.color  : '#A1B5CC',
        }}
      >
        <span className="flex items-center gap-2">
          {meta?.icon}
          {meta ? meta.label : 'Nenhum'}
        </span>
        <ChevronDown
          size={14}
          className={`opacity-60 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menu glass */}
      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden"
          style={{
            background:     'rgba(8, 12, 20, 0.96)',
            backdropFilter: 'blur(20px) saturate(160%)',
            border:         '1px solid rgba(255,255,255,0.09)',
            boxShadow:      '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {ALL_CHANNELS.map(ch => {
            const m = ch ? CHANNEL_META[ch] : null
            const isSelected = ch === value
            return (
              <button
                key={ch ?? '__none'}
                type="button"
                onClick={() => { onChange(ch); setOpen(false) }}
                className="flex items-center justify-between w-full px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-100 hover:bg-white/[0.05]"
                style={{ color: m ? m.color : '#A1B5CC' }}
              >
                <span className="flex items-center gap-2.5">
                  {m?.icon ?? null}
                  {m ? m.label : 'Nenhum'}
                </span>
                {isSelected && <Check size={13} className="text-[#FF6500]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function LeadPanel({
  lead,
  onClose,
  interactions,
  loadingInteractions,
  onAddInteraction,
  onUpdateLead,
}: LeadPanelProps) {
  const [, setSearchParams] = useSearchParams()
  const open = !!lead

  // ── Interaction form state ──────────────────────────────────────────────────
  const [newContent, setNewContent] = useState('')
  const [isSavingInteraction, setIsSavingInteraction] = useState(false)

  // ── Edit mode state ─────────────────────────────────────────────────────────
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [form, setForm] = useState<UpdateLeadPayload>(lead ? toForm(lead) : toForm({
    id: '', tenant_id: '', name: '', channel: null, contact: null,
    service: null, status: 'novo', notes: null, assigned_to: null,
    created_at: '', updated_at: '',
  }))
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const { updateLead } = useUpdateLead()

  // Sync URL quando abre/fecha
  useEffect(() => {
    if (lead) {
      setSearchParams({ leadId: lead.id }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [lead, setSearchParams])

  // Reset form + modo quando muda de lead
  useEffect(() => {
    if (lead) {
      setForm(toForm(lead))
      setMode('view')
    }
  }, [lead?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fecha com Escape (Esc no edit mode cancela; segundo Esc fecha)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (mode === 'edit') { setMode('view'); setForm(lead ? toForm(lead) : form) }
        else if (open) onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, mode, lead]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSaveInteraction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim() || !lead) return
    setIsSavingInteraction(true)
    try {
      await onAddInteraction(newContent.trim())
      setNewContent('')
    } catch (err) {
      console.error('Erro ao salvar interação:', err)
    } finally {
      setIsSavingInteraction(false)
    }
  }

  const handleSaveEdit = useCallback(async () => {
    if (!lead || !form.name.trim()) return
    setIsSavingEdit(true)

    // 1. Snapshot para rollback
    const snapshot = { ...lead }

    // 2. Optimistic: atualiza Kanban e header imediatamente
    const optimistic: Lead = {
      ...lead,
      ...form,
      updated_at: new Date().toISOString(),
    }
    onUpdateLead(optimistic)

    try {
      // 3. Persiste no banco
      const saved = await updateLead(lead.id, form)

      // 4. Confirma com dado real do banco (updated_at real)
      onUpdateLead(saved)
      setMode('view')
      toast.success('Lead atualizado', {
        description: `${saved.name} foi salvo com sucesso.`,
      })
    } catch {
      // 5. Rollback — restaura o lead original
      onUpdateLead(snapshot)
      setForm(toForm(snapshot))
      toast.error('Erro ao salvar', {
        description: 'Verifique sua conexão e tente novamente.',
      })
    } finally {
      setIsSavingEdit(false)
    }
  }, [lead, form, onUpdateLead, updateLead])

  const handleCancelEdit = useCallback(() => {
    if (lead) setForm(toForm(lead))
    setMode('view')
  }, [lead])

  // ─── Derived ───────────────────────────────────────────────────────────────

  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const statusMeta = lead ? STATUS_META[lead.status] : STATUS_META['novo']

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          'fixed top-0 right-0 bottom-0 z-50 w-full max-w-[480px]',
          'bg-[#080c14] border-l border-[#1E3E62]/30',
          'flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.55)]',
          'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {lead && (
          <>
            {/* ── Header ── */}
            <GlassCard variant="overlay" className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
              <div className="flex-1 pr-4 min-w-0">
                <h2 className="text-xl font-bold text-white tracking-tight leading-tight truncate">
                  {mode === 'view' ? lead.name : form.name || 'Novo nome…'}
                </h2>
                {(mode === 'view' ? lead.service : form.service) && (
                  <p className="text-sm text-[#A1B5CC] mt-1 flex items-center gap-1.5 font-medium">
                    <Sparkles size={12} className="text-[#FF6500] shrink-0" />
                    <span className="truncate">
                      {mode === 'view' ? lead.service : form.service}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A1B5CC] hover:text-white hover:bg-[#1E3E62]/20 transition-all shrink-0"
              >
                <X size={16} />
              </button>
            </GlassCard>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 overscroll-contain">

              {/* ─ VIEW MODE: Status + Canal badges ─ */}
              {mode === 'view' && (
                <div className="space-y-4">
                  {/* Header da seção com botão Editar */}
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-widest">
                      Dados do Lead
                    </p>
                    <button
                      onClick={() => setMode('edit')}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-[#FF6500] hover:text-[#FF6500]/80 transition-colors cursor-pointer"
                    >
                      <Edit2 size={11} />
                      Editar
                    </button>
                  </div>

                  {/* Status + Canal */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded border"
                      style={{
                        color:       statusMeta.color,
                        background:  statusMeta.bg,
                        borderColor: statusMeta.border,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: statusMeta.color }}
                      />
                      {statusMeta.label}
                    </span>

                    {lead.channel && (() => {
                      const ch = CHANNEL_META[lead.channel]
                      return (
                        <span
                          className="inline-flex items-center gap-1 text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-1 rounded border"
                          style={{ background: ch.bg, color: ch.color, borderColor: ch.border }}
                        >
                          {ch.icon}
                          {ch.label}
                        </span>
                      )
                    })()}
                  </div>

                  {/* Contato */}
                  {lead.contact && (
                    <div className="bg-black/30 px-3 py-2.5 rounded-lg border border-[#1E3E62]/15 flex items-center gap-2">
                      <Phone size={12} className="text-[#A1B5CC]/60 shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider">Contato</p>
                        <p className="text-[13px] text-white font-mono mt-0.5">{lead.contact}</p>
                      </div>
                    </div>
                  )}

                  {/* Notas */}
                  <div>
                    <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider mb-1.5">
                      Observações
                    </p>
                    {lead.notes ? (
                      <p className="text-[13px] text-white/80 leading-relaxed bg-black/20 p-3 rounded-lg border border-[#1E3E62]/10 whitespace-pre-wrap">
                        {lead.notes}
                      </p>
                    ) : (
                      <p className="text-[13px] text-[#A1B5CC]/35 italic">
                        Nenhuma observação cadastrada.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ─ EDIT MODE: formulário controlado ─ */}
              {mode === 'edit' && (
                <div className="space-y-4 animate-[fade-in_150ms_ease-out]">
                  {/* Header da seção */}
                  <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-widest">
                    Editar Dados do Lead
                  </p>

                  {/* Name */}
                  <DSInput
                    label="Nome"
                    required
                    value={form.name}
                    onChange={v => setForm(f => ({ ...f, name: v }))}
                    placeholder="Nome do lead"
                  />

                  {/* Service */}
                  <DSInput
                    label="Serviço"
                    value={form.service ?? ''}
                    onChange={v => setForm(f => ({ ...f, service: v || null }))}
                    placeholder="Ex: Social Media, Branding…"
                  />

                  {/* Contact */}
                  <DSInput
                    label="Contato"
                    value={form.contact ?? ''}
                    onChange={v => setForm(f => ({ ...f, contact: v || null }))}
                    placeholder="@usuario, +55 11 9…"
                  />

                  {/* Status + Channel em grid */}
                  <div className="grid grid-cols-2 gap-3 relative">
                    <StatusDropdown
                      value={form.status}
                      onChange={v => setForm(f => ({ ...f, status: v }))}
                    />
                    <ChannelDropdown
                      value={form.channel}
                      onChange={v => setForm(f => ({ ...f, channel: v }))}
                    />
                  </div>

                  {/* Notes */}
                  <DSTextarea
                    label="Observações"
                    value={form.notes ?? ''}
                    onChange={v => setForm(f => ({ ...f, notes: v || null }))}
                    placeholder="Detalhes sobre o lead, histórico informal…"
                    rows={4}
                  />

                  {/* Botões de ação */}
                  <div className="flex items-center justify-end gap-3 pt-1 pb-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSavingEdit}
                      className="px-4 py-2 text-[12px] font-semibold text-[#A1B5CC] hover:text-white rounded-lg border border-white/[0.08] hover:border-white/15 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isSavingEdit || !form.name.trim()}
                      className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                      style={{
                        background: isSavingEdit
                          ? 'rgba(255,101,0,0.55)'
                          : 'linear-gradient(135deg, #FF6500 0%, #e85500 100%)',
                        boxShadow: isSavingEdit
                          ? 'none'
                          : '0 2px 8px rgba(255,101,0,0.30), inset 0 1px 0 rgba(255,255,255,0.15)',
                      }}
                      onMouseEnter={e => {
                        if (!isSavingEdit) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(255,101,0,0.45), inset 0 1px 0 rgba(255,255,255,0.20)'
                      }}
                      onMouseLeave={e => {
                        if (!isSavingEdit) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(255,101,0,0.30), inset 0 1px 0 rgba(255,255,255,0.15)'
                      }}
                    >
                      {isSavingEdit
                        ? <><Loader2 size={13} className="animate-spin" /> Salvando…</>
                        : <><Check size={13} /> Salvar</>
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* ── Divisor ── */}
              <div className="h-px bg-[#1E3E62]/20" />

              {/* ── Nova Interação ── */}
              <div>
                <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider mb-2">
                  Registrar Nova Interação
                </p>
                <form onSubmit={handleSaveInteraction} className="relative">
                  <textarea
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="O que foi conversado com o lead?"
                    rows={3}
                    className="w-full text-[13px] bg-black/35 border border-[#1E3E62]/40 focus:border-[#FF6500]/45 focus:ring-2 focus:ring-[#FF6500]/08 rounded-lg p-3 text-white placeholder-[#A1B5CC]/35 outline-none resize-none transition-all duration-150"
                  />
                  <div className={`transition-all duration-200 ease-out overflow-hidden flex justify-end ${
                    newContent.trim()
                      ? 'opacity-100 max-h-12 translate-y-0 mt-2'
                      : 'opacity-0 max-h-0 -translate-y-1 pointer-events-none'
                  }`}>
                    <button
                      type="submit"
                      disabled={isSavingInteraction}
                      className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-white rounded-lg transition-all disabled:opacity-60 cursor-pointer hover:brightness-110"
                      style={{ background: '#FF6500', boxShadow: '0 2px 12px rgba(255,101,0,0.22)' }}
                    >
                      <PlusCircle size={13} />
                      {isSavingInteraction ? 'Salvando…' : 'Salvar Interação'}
                    </button>
                  </div>
                </form>
              </div>

              {/* ── Timeline ── */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider">
                  Histórico de Interações
                </p>

                {loadingInteractions ? (
                  <div className="flex flex-col items-center justify-center p-8 gap-3">
                    <div className="w-5 h-5 border-2 border-[#FF6500] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-mono text-[#A1B5CC]/60">Carregando timeline…</p>
                  </div>
                ) : sortedInteractions.length === 0 ? (
                  <div className="rounded-xl border border-[#1E3E62]/15 bg-black/10 p-6 text-center">
                    <p className="text-xs text-[#A1B5CC]/40">Nenhuma interação registrada ainda.</p>
                  </div>
                ) : (
                  <div className="flex flex-col mt-4">
                    {sortedInteractions.map((item, idx) => {
                      const isNewest = idx === 0
                      return (
                        <div key={item.id} className="relative pl-6 pb-6 last:pb-0">
                          {idx !== sortedInteractions.length - 1 && (
                            <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-[#1E3E62]/20" />
                          )}
                          {isNewest ? (
                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-[#FF6500] flex items-center justify-center bg-[#080c14] z-10">
                              <div className="absolute inset-0 rounded-full bg-[#FF6500]/40 animate-ping opacity-75" />
                              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6500] relative z-10" />
                            </div>
                          ) : (
                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-[#1E3E62]/60 flex items-center justify-center bg-[#080c14]">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#1E3E62]/60" />
                            </div>
                          )}
                          <span className="block text-[10px] font-mono text-[#A1B5CC]/70 tracking-tight">
                            {formatInteractionDate(item.created_at)}
                          </span>
                          <p className="text-[13px] text-white/95 mt-1 leading-relaxed whitespace-pre-wrap">
                            {item.note}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* ── Footer metadata ── */}
            <div className="px-6 py-4 border-t border-[#1E3E62]/20 flex items-center gap-2 text-[#A1B5CC]/50 text-[11px] font-mono shrink-0">
              <Calendar size={11} className="text-[#A1B5CC]/40" />
              <span>Criado em {formatDate(lead.created_at)}</span>
            </div>
          </>
        )}
      </div>
    </>
  )
}
