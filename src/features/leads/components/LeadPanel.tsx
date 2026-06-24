import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import {
  X, Instagram, MessageCircle, Users, Calendar,
  PlusCircle, Sparkles, Edit2, Check, Loader2,
  ChevronDown, Phone, Mail, Video, StickyNote,
  Send, Building, UserCircle, ClipboardList, Zap,
  FileText, Copy, ExternalLink, Eye,
} from 'lucide-react'
import type { Lead, LeadStatus, LeadChannel } from '@/types/pipeline'
import type { LeadInteraction, InteractionType, Company, Contact, MessageTemplateChannel } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { GlassCard } from '@/components/ui/GlassCard'
import { useUpdateLead, type UpdateLeadPayload } from '../hooks/useUpdateLead'
import { useTasks } from '../hooks/useTasks'
import { AUTOMATION_MARKER } from '@/lib/automations'
import type { Task } from '@/types/database'
import { useMessageTemplates, CATEGORY_META } from '../hooks/useMessageTemplates'
import { useProposals } from '@/features/proposals/hooks/useProposals'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeadPanelProps {
  lead: Lead | null
  onClose: () => void
  interactions: LeadInteraction[]
  loadingInteractions: boolean
  onAddInteraction: (content: string, type?: InteractionType) => Promise<void>
  onUpdateLead: (updated: Lead) => void
  isNewLead?: boolean
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
    phone:   lead.phone,
    email:   lead.email,
    notes:   lead.notes,
    status:  lead.status,
    company: null,
    contactPerson: null,
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

function formatInteractionDate(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (diffMins < 1) return 'Agora mesmo'
  if (diffMins < 60) return `Há ${diffMins}min`
  if (diffHours < 24 && date.getDate() === now.getDate()) return `Hoje às ${time}`

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
    return `Ontem às ${time}`
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(date)
}

const INTERACTION_TYPES: Array<{
  type: InteractionType
  label: string
  emoji: string
  color: string
  requiresPhone?: boolean
}> = [
  { type: 'note',      label: 'Nota',      emoji: '📝', color: '#A1B5CC' },
  { type: 'call',      label: 'Ligação',   emoji: '📞', color: '#4ADE80' },
  { type: 'whatsapp',  label: 'WhatsApp',  emoji: '💬', color: '#4ADE80', requiresPhone: true },
  { type: 'email',     label: 'E-mail',    emoji: '✉',  color: '#60A5FA' },
  { type: 'meeting',   label: 'Reunião',   emoji: '🤝', color: '#F59E0B' },
  { type: 'instagram', label: 'Instagram', emoji: '📸', color: '#F472B6' },
]

function formatTaskDate(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (date.toDateString() === now.toDateString()) return `Hoje às ${time}`

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) return `Amanhã às ${time}`

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(date)
}

function getInteractionIcon(type: InteractionType) {
  const meta = INTERACTION_TYPES.find(t => t.type === type)
  return { emoji: meta?.emoji ?? '📝', color: meta?.color ?? '#A1B5CC' }
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

// ─── Template channel meta ────────────────────────────────────────────────────

const TEMPLATE_CHANNEL_META: Record<
  MessageTemplateChannel | 'todos',
  { label: string; color: string; bg: string; border: string }
> = {
  todos:     { label: 'Todos',     color: '#A1B5CC', bg: 'rgba(161,181,204,0.08)', border: 'rgba(161,181,204,0.18)' },
  whatsapp:  { label: 'WhatsApp',  color: '#4ADE80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.20)'  },
  email:     { label: 'E-mail',    color: '#60A5FA', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.20)'  },
  instagram: { label: 'Instagram', color: '#F472B6', bg: 'rgba(244,114,182,0.10)', border: 'rgba(244,114,182,0.20)' },
  geral:     { label: 'Geral',     color: '#A1B5CC', bg: 'rgba(161,181,204,0.08)', border: 'rgba(161,181,204,0.18)' },
}

const CHANNEL_FILTER_ORDER: Array<MessageTemplateChannel | 'todos'> = [
  'todos', 'whatsapp', 'email', 'instagram', 'geral',
]

// Maps template channel → interaction type chip
const CHANNEL_TO_INTERACTION: Partial<Record<MessageTemplateChannel, InteractionType>> = {
  whatsapp:  'whatsapp',
  email:     'email',
  instagram: 'instagram',
}

type LeadPanelTab = 'dados' | 'interacoes' | 'tarefas' | 'propostas'

const TAB_ITEMS: Array<{ key: LeadPanelTab; label: string }> = [
  { key: 'dados', label: 'Dados' },
  { key: 'interacoes', label: 'Interações' },
  { key: 'tarefas', label: 'Tarefas' },
  { key: 'propostas', label: 'Propostas' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Input padronizado com estilo dark-luxury do design system §5 */
function DSInput({
  label, value, onChange, placeholder, required, autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  autoFocus?: boolean
}) {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (autoFocus) {
      setFocused(true)
    }
  }, [autoFocus])

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
        autoFocus={autoFocus}
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

// ─── TemplateDrawer ──────────────────────────────────────────────────────────

interface TemplateDrawerProps {
  open: boolean
  anchorRef: React.RefObject<HTMLButtonElement | null>
  lead: Lead
  onSelect: (body: string, channel: MessageTemplateChannel) => void
  onClose: () => void
}

function TemplateDrawer({ open, anchorRef, lead, onSelect, onClose }: TemplateDrawerProps) {
  const { templates, templatesByCategory, loading, substituteVariables } = useMessageTemplates()
  const [channelFilter, setChannelFilter] = useState<MessageTemplateChannel | 'todos'>('todos')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const drawerRef = useRef<HTMLDivElement>(null)

  // ── Compute position anchored to the button ────────────────────────────────
  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const DRAWER_HEIGHT = 480
      const DRAWER_WIDTH  = 320
      const spaceBelow    = window.innerHeight - rect.bottom
      const top = spaceBelow >= DRAWER_HEIGHT
        ? rect.bottom + 8
        : rect.top - DRAWER_HEIGHT - 8
      const left = Math.max(8, Math.min(rect.right - DRAWER_WIDTH, window.innerWidth - DRAWER_WIDTH - 8))
      setPosition({ top, left })
    }
  }, [open, anchorRef])

  // ── Close on click outside ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (
        drawerRef.current && !drawerRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open, onClose, anchorRef])

  // ── Close on Esc ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const filtered = channelFilter === 'todos'
    ? templates
    : templates.filter(t => t.channel === channelFilter)

  const orderedCategories = (Object.keys(CATEGORY_META) as Array<keyof typeof CATEGORY_META>)
    .sort((a, b) => CATEGORY_META[a].order - CATEGORY_META[b].order)
    .filter(cat => filtered.some(t => t.category === cat))

  // ── Drawer content ───────────────────────────────────────────────────────────
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={drawerRef}
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1,    y:  0 }}
          exit={{    opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            position:       'fixed',
            top:            position.top,
            left:           position.left,
            zIndex:         9999,
            width:          320,
            maxHeight:      480,
            display:        'flex',
            flexDirection:  'column',
            background:     'rgba(8,12,20,0.96)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border:         '1px solid rgba(255,255,255,0.09)',
            borderRadius:   '12px',
            boxShadow:      '0 8px 32px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <Zap size={13} className="text-[#FF6500]" />
              <span className="text-[14px] font-semibold text-white">Templates</span>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-md text-[#A1B5CC] hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>

          {/* Channel filter chips */}
          <div className="px-3 pt-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
            {CHANNEL_FILTER_ORDER.map(ch => {
              const meta = TEMPLATE_CHANNEL_META[ch]
              const isActive = channelFilter === ch
              return (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className="whitespace-nowrap text-[11px] font-medium transition-all duration-150 cursor-pointer shrink-0"
                  style={{
                    background:   isActive ? 'rgba(255,101,0,0.10)' : 'rgba(255,255,255,0.04)',
                    border:       `1px solid ${isActive ? 'rgba(255,101,0,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '6px',
                    padding:      '4px 10px',
                    color:        isActive ? '#FF6500' : '#A1B5CC',
                  }}
                >
                  {meta.label}
                </button>
              )
            })}
          </div>

          {/* Template list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="ds-spinner" />
              </div>
            ) : orderedCategories.length === 0 ? (
              <p className="text-center text-[12px] text-[#A1B5CC]/50 py-8">
                Nenhum template encontrado.
              </p>
            ) : (
              orderedCategories.map(cat => (
                <div key={cat}>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2 px-0.5"
                    style={{ color: '#A1B5CC' }}
                  >
                    {CATEGORY_META[cat].label}
                  </p>
                  <div className="space-y-1.5">
                    {(templatesByCategory[cat] ?? [])
                      .filter(t => channelFilter === 'todos' || t.channel === channelFilter)
                      .map(tpl => {
                        const chMeta = TEMPLATE_CHANNEL_META[tpl.channel]
                        const preview = substituteVariables(tpl.body, lead)
                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => { onSelect(preview, tpl.channel); onClose() }}
                            className="w-full text-left transition-all duration-150 cursor-pointer"
                            style={{
                              background:   'rgba(255,255,255,0.04)',
                              border:       '1px solid rgba(255,255,255,0.07)',
                              borderRadius: '8px',
                              padding:      '10px 12px',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,101,0,0.25)'
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'
                            }}
                          >
                            <p className="text-[13px] font-medium text-white leading-snug mb-1">
                              {tpl.title}
                            </p>
                            <p
                              className="text-[11px] leading-relaxed mb-2"
                              style={{
                                color: '#A1B5CC',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {preview}
                            </p>
                            <span
                              className="inline-flex items-center text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                              style={{
                                color:      chMeta.color,
                                background: chMeta.bg,
                                border:     `1px solid ${chMeta.border}`,
                              }}
                            >
                              {chMeta.label}
                            </span>
                          </button>
                        )
                      })
                    }
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.06] shrink-0">
            <span className="text-[11px] text-[#FF6500]/60 cursor-default select-none">
              Gerenciar templates →
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
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
  isNewLead,
}: LeadPanelProps) {
  const [, setSearchParams] = useSearchParams()
  const open = !!lead

  // ── Interaction form state ──────────────────────────────────────────────────
  const [newContent, setNewContent] = useState('')
  const [selectedType, setSelectedType] = useState<InteractionType>('note')
  const [isSavingInteraction, setIsSavingInteraction] = useState(false)
  const [showTemplateDrawer, setShowTemplateDrawer] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const zapButtonRef = useRef<HTMLButtonElement>(null)

  // ── Edit mode state ─────────────────────────────────────────────────────────
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [form, setForm] = useState<UpdateLeadPayload>(lead ? toForm(lead) : toForm({
    id: '', tenant_id: '', name: '', channel: null, contact: null,
    phone: null, email: null,
    service: null, status: 'novo', notes: null, assigned_to: null,
    company_id: null, contact_id: null,
    created_at: '', updated_at: '',
  }))
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // ── B2B associated data ────────────────────────────────────────────────────
  const [company, setCompany] = useState<Company | null>(null)
  const [contactPerson, setContactPerson] = useState<Contact | null>(null)

  useEffect(() => {
    if (!lead) { setCompany(null); setContactPerson(null); return }

    if (lead.company_id) {
      supabase.from('companies').select('*').eq('id', lead.company_id).single()
        .then(({ data }) => {
          if (data) setCompany(data as Company)
        })
    } else { setCompany(null) }

    if (lead.contact_id) {
      supabase.from('contacts').select('*').eq('id', lead.contact_id).single()
        .then(({ data }) => {
          if (data) setContactPerson(data as Contact)
        })
    } else { setContactPerson(null) }
  }, [lead?.id, lead?.company_id, lead?.contact_id]) // eslint-disable-line react-hooks/exhaustive-deps

  const { updateLead } = useUpdateLead()

  // ── Tasks ──────────────────────────────────────────────────────────────────
  const { tasks, loading: loadingTasks, addTask, toggleTask } = useTasks(lead?.id ?? null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDate, setNewTaskDate] = useState('')
  const [isSavingTask, setIsSavingTask] = useState(false)

  // ── Proposals ─────────────────────────────────────────────────────────────
  const { proposals, isLoading: loadingProposals, createProposal } = useProposals(lead?.id ?? null)
  const [proposalForm, setProposalForm] = useState({ title: '', scope: '', value: '', validDays: '7' })
  const [isCreatingProposal, setIsCreatingProposal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [activeTab, setActiveTab] = useState<LeadPanelTab>('dados')

  const activeProposal = proposals.find(p => p.status !== 'cancelled')

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proposalForm.title.trim() || !lead) return
    setIsCreatingProposal(true)

    const rawValue = proposalForm.value.replace(/\D/g, '')
    const numValue = rawValue ? parseInt(rawValue, 10) / 100 : null
    const days = parseInt(proposalForm.validDays, 10) || 7
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + days)

    await createProposal({
      lead_id: lead.id,
      title: proposalForm.title.trim(),
      scope: proposalForm.scope.trim() || null,
      value: numValue,
      valid_until: validUntil.toISOString(),
    })
    setProposalForm({ title: '', scope: '', value: '', validDays: '7' })
    setIsCreatingProposal(false)
  }

  const handleCopyLink = (slug: string) => {
    const link = `${window.location.origin}/p/${slug}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const formatCurrencyInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return ''
    const num = parseInt(digits, 10) / 100
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleSendProposalEmail = async (slug: string) => {
    if (!lead) return
    const contactId = lead.contact_id
    if (!contactId) {
      toast.error('Sem contato vinculado', { description: 'Adicione um contato com e-mail ao lead.', className: 'glass-card' })
      return
    }
    const { data: contact } = await supabase.from('contacts').select('name, email').eq('id', contactId).single()
    if (!contact?.email) {
      toast.error('Contato sem e-mail', { description: 'O contato deste lead não possui e-mail cadastrado.', className: 'glass-card' })
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    const proposalLink = `${window.location.origin}/p/${slug}`
    const res = await fetch('/api/send-proposal-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ to: contact.email, contactName: contact.name, leadName: lead.name, proposalLink }),
    })
    if (res.ok) {
      toast.success('E-mail enviado', { description: `Proposta enviada para ${contact.email}`, className: 'glass-card' })
    } else {
      toast.error('Falha ao enviar e-mail', { className: 'glass-card' })
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !newTaskDate) return
    setIsSavingTask(true)
    await addTask(newTaskTitle.trim(), new Date(newTaskDate).toISOString())
    setNewTaskTitle('')
    setNewTaskDate('')
    setIsSavingTask(false)
  }

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
      const base = toForm(lead)
      if (company) {
        base.company = { name: company.name, document: company.document, industry: company.industry, website: company.website }
      }
      if (contactPerson) {
        base.contactPerson = { name: contactPerson.name, email: contactPerson.email, phone: contactPerson.phone, role: contactPerson.role }
      }
      setForm(base)
      setMode(isNewLead ? 'edit' : 'view')
      setActiveTab('dados')
    }
  }, [lead?.id, isNewLead, company, contactPerson]) // eslint-disable-line react-hooks/exhaustive-deps

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
      const content = newContent.trim()
      await onAddInteraction(content, selectedType)

      // Ação de canal: abrir WhatsApp ou e-mail após salvar
      if (selectedType === 'whatsapp' && lead.phone) {
        const cleaned = cleanPhone(lead.phone)
        window.open(`https://wa.me/55${cleaned}?text=${encodeURIComponent(content)}`, '_blank')
      } else if (selectedType === 'email' && lead.email) {
        window.open(`mailto:${lead.email}?subject=Mensagem&body=${encodeURIComponent(content)}`, '_blank')
      }

      setNewContent('')
      setSelectedType('note')
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
    const { company: _c, contactPerson: _cp, ...leadFields } = form
    const optimistic: Lead = {
      ...lead,
      ...leadFields,
      updated_at: new Date().toISOString(),
    }
    onUpdateLead(optimistic)

    try {
      // 3. Persiste no banco
      const saved = await updateLead(lead.id, form, lead.status)

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
    <AnimatePresence>
      {open && lead && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[8px] z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[900px] max-h-[85vh] flex flex-col rounded-2xl pointer-events-auto overflow-hidden"
              style={{
                background: '#080c14',
                border: '1px solid rgba(255, 255, 255, 0.10)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* ── Header ── */}
              <GlassCard variant="overlay" className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0 rounded-none">
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
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-[#A1B5CC] hover:text-white hover:bg-white/[0.06] transition-all shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </GlassCard>

              {/* ── Tab Bar ── */}
              <div className="flex shrink-0 px-6 gap-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {TAB_ITEMS.map(tab => {
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className="cursor-pointer transition-colors duration-150"
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#ffffff' : 'rgba(161,181,204,0.6)',
                        borderBottom: isActive ? '2px solid #FF6500' : '2px solid transparent',
                        background: 'none',
                        border: 'none',
                        borderBottomWidth: '2px',
                        borderBottomStyle: 'solid',
                        borderBottomColor: isActive ? '#FF6500' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(161,181,204,1)' }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(161,181,204,0.6)' }}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 overscroll-contain">

              {activeTab === 'dados' && (
              <>
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

                  {/* Phone + Email (view mode) */}
                  {(lead.phone || lead.email) && (
                    <div className="flex flex-col gap-1.5">
                      {lead.phone && (
                        <div className="bg-black/30 px-3 py-2 rounded-lg border border-[#1E3E62]/15 flex items-center gap-2">
                          <Phone size={11} className="text-[#4ADE80]/60 shrink-0" />
                          <p className="text-[13px] text-white font-mono">{lead.phone}</p>
                        </div>
                      )}
                      {lead.email && (
                        <div className="bg-black/30 px-3 py-2 rounded-lg border border-[#1E3E62]/15 flex items-center gap-2">
                          <Mail size={11} className="text-[#60A5FA]/60 shrink-0" />
                          <p className="text-[13px] text-white font-mono">{lead.email}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Ações Rápidas ── */}
                  {(lead.phone || lead.email) && (
                    <div>
                      <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-[0.12em] mb-2">
                        Ações Rápidas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/55${cleanPhone(lead.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-150 hover:brightness-110"
                            style={{
                              color: '#4ADE80',
                              background: 'rgba(74,222,128,0.10)',
                              border: '1px solid rgba(74,222,128,0.20)',
                              borderRadius: '8px',
                              padding: '6px 12px',
                            }}
                          >
                            <MessageCircle size={13} />
                            WhatsApp
                          </a>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}?subject=Olá ${encodeURIComponent(lead.name)}&body=Olá ${encodeURIComponent(lead.name)},`}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-150 hover:brightness-110"
                            style={{
                              color: '#60A5FA',
                              background: 'rgba(96,165,250,0.10)',
                              border: '1px solid rgba(96,165,250,0.20)',
                              borderRadius: '8px',
                              padding: '6px 12px',
                            }}
                          >
                            <Mail size={13} />
                            E-mail
                          </a>
                        )}
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

                  {/* B2B: Empresa (view) */}
                  {company && (
                    <div className="bg-black/30 px-3 py-2.5 rounded-lg border border-[#1E3E62]/15">
                      <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Building size={11} className="text-[#A1B5CC]/60" />
                        Empresa
                      </p>
                      <p className="text-[13px] text-white font-medium">{company.name}</p>
                      {company.website && (
                        <p className="text-[11px] text-[#A1B5CC]/60 font-mono mt-0.5">{company.website}</p>
                      )}
                    </div>
                  )}

                  {/* B2B: Contato (view) */}
                  {contactPerson && (
                    <div className="bg-black/30 px-3 py-2.5 rounded-lg border border-[#1E3E62]/15">
                      <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <UserCircle size={11} className="text-[#A1B5CC]/60" />
                        Contato
                      </p>
                      <p className="text-[13px] text-white font-medium">{contactPerson.name}</p>
                      {contactPerson.role && (
                        <p className="text-[11px] text-[#A1B5CC]/60 mt-0.5">{contactPerson.role}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        {contactPerson.email && (
                          <span className="text-[11px] text-[#A1B5CC]/60 font-mono flex items-center gap-1">
                            <Mail size={10} /> {contactPerson.email}
                          </span>
                        )}
                        {contactPerson.phone && (
                          <span className="text-[11px] text-[#A1B5CC]/60 font-mono flex items-center gap-1">
                            <Phone size={10} /> {contactPerson.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
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
                    autoFocus={isNewLead}
                  />

                  {/* Contact */}
                  <DSInput
                    label="Contato"
                    value={form.contact ?? ''}
                    onChange={v => setForm(f => ({ ...f, contact: v || null }))}
                    placeholder="@usuario, +55 11 9…"
                  />

                  {/* Phone + Email */}
                  <div className="grid grid-cols-2 gap-3">
                    <DSInput
                      label="Telefone"
                      value={form.phone ?? ''}
                      onChange={v => setForm(f => ({ ...f, phone: v || null }))}
                      placeholder="+55 11 99999-9999"
                    />
                    <DSInput
                      label="E-mail"
                      value={form.email ?? ''}
                      onChange={v => setForm(f => ({ ...f, email: v || null }))}
                      placeholder="email@cliente.com"
                    />
                  </div>

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

                  {/* ── B2B: Empresa ── */}
                  <div className="pt-2">
                    <div className="h-px bg-[#1E3E62]/20 mb-4" />
                    <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Building size={11} className="text-[#A1B5CC]/60" />
                      Dados da Empresa
                    </p>
                    <div className="space-y-3">
                      <DSInput
                        label="Razão Social / Nome"
                        value={form.company?.name ?? ''}
                        onChange={v => setForm(f => ({
                          ...f,
                          company: { ...f.company, name: v, document: f.company?.document ?? null, industry: f.company?.industry ?? null, website: f.company?.website ?? null },
                        }))}
                        placeholder="Nome da empresa"
                      />
                      <DSInput
                        label="Website"
                        value={form.company?.website ?? ''}
                        onChange={v => setForm(f => ({
                          ...f,
                          company: { ...f.company, name: f.company?.name ?? '', website: v || null, document: f.company?.document ?? null, industry: f.company?.industry ?? null },
                        }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* ── B2B: Contato ── */}
                  <div className="pt-2">
                    <div className="h-px bg-[#1E3E62]/20 mb-4" />
                    <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <UserCircle size={11} className="text-[#A1B5CC]/60" />
                      Dados do Contato
                    </p>
                    <div className="space-y-3">
                      <DSInput
                        label="Nome do contato"
                        value={form.contactPerson?.name ?? ''}
                        onChange={v => setForm(f => ({
                          ...f,
                          contactPerson: { ...f.contactPerson, name: v, email: f.contactPerson?.email ?? null, phone: f.contactPerson?.phone ?? null, role: f.contactPerson?.role ?? null },
                        }))}
                        placeholder="Nome da pessoa"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <DSInput
                          label="E-mail"
                          value={form.contactPerson?.email ?? ''}
                          onChange={v => setForm(f => ({
                            ...f,
                            contactPerson: { ...f.contactPerson, name: f.contactPerson?.name ?? '', email: v || null, phone: f.contactPerson?.phone ?? null, role: f.contactPerson?.role ?? null },
                          }))}
                          placeholder="email@empresa.com"
                        />
                        <DSInput
                          label="Telefone"
                          value={form.contactPerson?.phone ?? ''}
                          onChange={v => setForm(f => ({
                            ...f,
                            contactPerson: { ...f.contactPerson, name: f.contactPerson?.name ?? '', phone: v || null, email: f.contactPerson?.email ?? null, role: f.contactPerson?.role ?? null },
                          }))}
                          placeholder="+55 11 9..."
                        />
                      </div>
                      <DSInput
                        label="Cargo"
                        value={form.contactPerson?.role ?? ''}
                        onChange={v => setForm(f => ({
                          ...f,
                          contactPerson: { ...f.contactPerson, name: f.contactPerson?.name ?? '', role: v || null, email: f.contactPerson?.email ?? null, phone: f.contactPerson?.phone ?? null },
                        }))}
                        placeholder="Ex: Diretor de Marketing"
                      />
                    </div>
                  </div>

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

              </>
              )}

              {activeTab === 'interacoes' && (
              <>
              {/* ── Nova Interação ── */}
              <div>
                <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-[0.12em] mb-3">
                  Registrar Nova Interação
                </p>

                {/* Type chips + ⚡ template button */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3 relative">
                  {INTERACTION_TYPES
                    .filter(({ requiresPhone }) => !requiresPhone || !!lead?.phone)
                    .map(({ type, label, emoji }) => {
                      const isActive = selectedType === type
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedType(type)}
                          className="flex items-center gap-1.5 text-[11px] font-medium transition-all duration-150 cursor-pointer"
                          style={{
                            background:   isActive ? 'rgba(255,101,0,0.10)' : 'rgba(255,255,255,0.04)',
                            border:       `1px solid ${isActive ? 'rgba(255,101,0,0.35)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '6px',
                            padding:      '4px 10px',
                            color:        isActive ? '#FF6500' : '#A1B5CC',
                            transition:   'all 150ms ease',
                          }}
                        >
                          <span>{emoji}</span>
                          <span>{label}</span>
                        </button>
                      )
                    })
                  }

                  {/* ── Divider + chip Templates ── */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {/* Divider vertical sutil */}
                    <div className="w-px h-4 bg-white/[0.08]" />

                    {/* Chip Templates */}
                    <button
                      ref={zapButtonRef}
                      type="button"
                      onClick={() => setShowTemplateDrawer(v => !v)}
                      className="flex items-center gap-1 text-[11px] font-medium transition-all duration-150 cursor-pointer"
                      style={{
                        background:   showTemplateDrawer ? 'rgba(255,101,0,0.10)' : 'rgba(255,255,255,0.04)',
                        border:       `1px solid ${showTemplateDrawer ? 'rgba(255,101,0,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '6px',
                        padding:      '4px 10px',
                        color:        showTemplateDrawer ? '#FF6500' : '#A1B5CC',
                        transition:   'all 150ms ease',
                      }}
                    >
                      <Zap size={12} />
                      <span>Templates</span>
                    </button>
                  </div>
                </div>

                {/* Template Drawer — renderizado via Portal fora do modal */}
                <TemplateDrawer
                  open={showTemplateDrawer}
                  anchorRef={zapButtonRef}
                  lead={lead}
                  onSelect={(body, channel) => {
                    setNewContent(body)
                    const mapped = CHANNEL_TO_INTERACTION[channel]
                    if (mapped) setSelectedType(mapped)
                    setShowTemplateDrawer(false)
                    setTimeout(() => textareaRef.current?.focus(), 50)
                  }}
                  onClose={() => setShowTemplateDrawer(false)}
                />

                <form onSubmit={handleSaveInteraction} className="relative">
                  <textarea
                    ref={textareaRef}
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSaveInteraction(e)
                      }
                    }}
                    placeholder="O que foi conversado com o lead?"
                    rows={3}
                    className="w-full text-[13px] bg-white/[0.03] border border-white/[0.08] focus:border-[#FF6500]/40 focus:ring-1 focus:ring-[#FF6500]/10 rounded-xl p-3 pr-11 text-white placeholder-white/25 outline-none resize-none transition-all duration-150"
                  />
                  {/* Send button inside textarea */}
                  <button
                    type="submit"
                    disabled={!newContent.trim() || isSavingInteraction}
                    className="absolute right-2.5 bottom-2.5 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-20 cursor-pointer"
                    style={{
                      background: newContent.trim() ? '#FF6500' : 'transparent',
                      boxShadow: newContent.trim() ? '0 2px 8px rgba(255,101,0,0.25)' : 'none',
                    }}
                  >
                    {isSavingInteraction
                      ? <Loader2 size={13} className="text-white animate-spin" />
                      : <Send size={13} className="text-white" />
                    }
                  </button>
                </form>
              </div>

              {/* ── Timeline ── */}
              <div>
                <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-[0.12em] mb-4">
                  Histórico
                  {sortedInteractions.length > 0 && (
                    <span className="ml-1.5 text-white/30 font-mono">{sortedInteractions.length}</span>
                  )}
                </p>

                {loadingInteractions ? (
                  <div className="flex flex-col items-center justify-center p-8 gap-3">
                    <div className="ds-spinner" />
                    <p className="text-[10px] font-mono text-[#A1B5CC]/50">Carregando timeline…</p>
                  </div>
                ) : sortedInteractions.length === 0 ? (
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-8 text-center">
                    <MessageCircle size={20} className="mx-auto mb-2 text-white/15" />
                    <p className="text-[13px] text-white/30">Nenhuma interação registrada.</p>
                    <p className="text-[11px] text-white/15 mt-1">Registre notas, ligações ou e-mails acima.</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-[13px] top-2 bottom-0 w-px bg-white/[0.08]" />

                    <AnimatePresence initial={false}>
                      {sortedInteractions.map((item, idx) => {
                        const isNewest = idx === 0
                        const { emoji: typeEmoji, color: typeColor } = getInteractionIcon(item.type ?? 'note')

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="relative pl-9 pb-5 last:pb-0"
                          >
                            {/* Timeline node */}
                            <div
                              className="absolute left-1 top-1 w-[22px] h-[22px] rounded-full flex items-center justify-center z-10"
                              style={{
                                background: '#080c14',
                                border: `2px solid ${isNewest ? typeColor : 'rgba(30,62,98,0.40)'}`,
                                boxShadow: isNewest ? `0 0 8px ${typeColor}30` : 'none',
                                color: isNewest ? typeColor : 'rgba(30,62,98,0.60)',
                              }}
                            >
                               <span style={{ fontSize: '10px' }}>{typeEmoji}</span>
                            </div>

                            {/* Content card */}
                            <div
                              className="rounded-xl px-3.5 py-3 transition-colors duration-150"
                              style={{
                                background: isNewest ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${isNewest ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                              }}
                            >
                              {/* Meta row */}
                              <div className="flex items-center gap-2 mb-1.5">
                                <span
                                  className="text-[9px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded"
                                  style={{
                                    color: typeColor,
                                    background: `${typeColor}12`,
                                  }}
                                >
                                  {INTERACTION_TYPES.find(t => t.type === (item.type ?? 'note'))?.label ?? 'Nota'} {INTERACTION_TYPES.find(t => t.type === (item.type ?? 'note'))?.emoji ?? '📝'}
                                </span>
                                {item.content.includes(AUTOMATION_MARKER) && (
                                  <span
                                    className="text-[9px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded flex items-center gap-1"
                                    style={{ color: '#FF6500', background: 'rgba(255,101,0,0.10)' }}
                                  >
                                    <Sparkles size={9} />
                                    Auto
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-white/30">
                                  {formatInteractionDate(item.created_at)}
                                </span>
                              </div>

                              {/* Content */}
                              <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">
                                {item.content}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              </>
              )}

              {activeTab === 'tarefas' && (
              <>
              {/* ── Tarefas / Follow-ups ── */}
              <div>
                <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-[0.12em] mb-3 flex items-center gap-1.5">
                  <ClipboardList size={11} className="text-[#A1B5CC]/60" />
                  Tarefas
                  {tasks.filter(t => t.status === 'pending').length > 0 && (
                    <span className="text-white/30 font-mono">{tasks.filter(t => t.status === 'pending').length}</span>
                  )}
                </p>

                {/* New task form */}
                <form onSubmit={handleAddTask} className="space-y-2 mb-4">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="Ex: Ligar para cliente, Enviar contrato..."
                    className="w-full rounded-xl px-3 py-2 text-[13px] bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/25 outline-none transition-all duration-150 focus:border-[#FF6500]/40 focus:ring-1 focus:ring-[#FF6500]/10"
                  />
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={newTaskDate}
                      onChange={e => setNewTaskDate(e.target.value)}
                      className="flex-1 rounded-xl px-3 py-2 text-[12px] font-mono bg-white/[0.03] border border-white/[0.08] text-white/70 outline-none transition-all duration-150 focus:border-[#FF6500]/40 focus:ring-1 focus:ring-[#FF6500]/10 [color-scheme:dark]"
                    />
                    <button
                      type="submit"
                      disabled={!newTaskTitle.trim() || !newTaskDate || isSavingTask}
                      className="px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 disabled:opacity-30 cursor-pointer"
                      style={{
                        background: newTaskTitle.trim() && newTaskDate ? '#FF6500' : 'transparent',
                        color: '#fff',
                        boxShadow: newTaskTitle.trim() && newTaskDate ? '0 2px 8px rgba(255,101,0,0.25)' : 'none',
                      }}
                    >
                      {isSavingTask ? <Loader2 size={13} className="animate-spin" /> : <PlusCircle size={13} />}
                    </button>
                  </div>
                </form>

                {/* Task list */}
                {loadingTasks ? (
                  <div className="flex justify-center py-4">
                    <div className="ds-spinner" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-6 text-center">
                    <p className="text-[13px] text-white/30">Nenhuma tarefa cadastrada.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {tasks.map(task => {
                      const isOverdue = task.status === 'pending' && new Date(task.due_date) < new Date()
                      const isCompleted = task.status === 'completed'
                      const dueLabel = formatTaskDate(task.due_date)

                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-150"
                          style={{
                            background: isOverdue ? 'rgba(179,38,30,0.08)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isOverdue ? 'rgba(179,38,30,0.20)' : 'rgba(255,255,255,0.04)'}`,
                          }}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="mt-0.5 w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all duration-150"
                            style={{
                              borderColor: isCompleted ? '#22C55E' : isOverdue ? '#b3261e' : 'rgba(255,255,255,0.15)',
                              background: isCompleted ? 'rgba(34,197,94,0.15)' : 'transparent',
                            }}
                          >
                            {isCompleted && <Check size={11} className="text-[#22C55E]" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[13px] leading-snug"
                              style={{
                                color: isCompleted ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.80)',
                                textDecoration: isCompleted ? 'line-through' : 'none',
                              }}
                            >
                              {task.title}
                            </p>
                            <span
                              className="text-[10px] font-mono mt-0.5 block"
                              style={{
                                color: isOverdue ? '#b3261e' : 'rgba(161,181,204,0.5)',
                              }}
                            >
                              {isOverdue && '⚠ '}{dueLabel}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              </>
              )}

              {activeTab === 'propostas' && (
              <>
              {/* ── Propostas ── */}
              <div>
                <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-[0.12em] mb-3 flex items-center gap-1.5">
                  <FileText size={11} className="text-[#A1B5CC]/60" />
                  Propostas
                  {activeProposal && (
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ml-1"
                      style={{
                        color: activeProposal.status === 'accepted' ? '#22C55E' : '#F59E0B',
                        background: activeProposal.status === 'accepted' ? 'rgba(34,197,94,0.10)' : 'rgba(245,158,11,0.10)',
                      }}
                    >
                      {activeProposal.status === 'accepted' ? 'Aceita' : activeProposal.status === 'draft' ? 'Rascunho' : 'Enviada'}
                    </span>
                  )}
                </p>

                {loadingProposals ? (
                  <div className="flex justify-center py-4">
                    <div className="ds-spinner" />
                  </div>
                ) : activeProposal ? (
                  <div className="space-y-3">
                    {/* Proposal card */}
                    <div
                      className="rounded-xl px-4 py-3.5"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <p className="text-[14px] font-semibold text-white leading-snug mb-1">
                        {activeProposal.title}
                      </p>
                      {activeProposal.value != null && activeProposal.value > 0 && (
                        <p className="text-[13px] font-mono" style={{ color: '#FF6500' }}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activeProposal.value)}
                        </p>
                      )}
                      {activeProposal.valid_until && (
                        <p className="text-[11px] font-mono mt-1" style={{ color: '#A1B5CC' }}>
                          Válida até {formatDate(activeProposal.valid_until)}
                        </p>
                      )}
                    </div>

                    {/* Link + Copy */}
                    <div
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <ExternalLink size={12} className="text-[#A1B5CC]/50 shrink-0" />
                      <span className="text-[12px] font-mono text-[#A1B5CC] truncate flex-1">
                        /p/{activeProposal.slug}
                      </span>
                      <motion.button
                        type="button"
                        onClick={() => handleCopyLink(activeProposal.slug)}
                        className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition-all duration-150 cursor-pointer shrink-0"
                        style={{
                          background: copiedLink ? 'rgba(34,197,94,0.10)' : 'rgba(255,101,0,0.10)',
                          border: `1px solid ${copiedLink ? 'rgba(34,197,94,0.25)' : 'rgba(255,101,0,0.25)'}`,
                          color: copiedLink ? '#22C55E' : '#FF6500',
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <AnimatePresence mode="wait">
                          {copiedLink ? (
                            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                              <Check size={12} />
                            </motion.span>
                          ) : (
                            <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                              <Copy size={12} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {copiedLink ? 'Copiado' : 'Copiar'}
                      </motion.button>
                    </div>

                    {/* View tracking */}
                    {(activeProposal.viewed_count > 0 || activeProposal.viewed_at) && (
                      <div className="flex items-center gap-2 text-[11px] font-mono" style={{ color: '#A1B5CC' }}>
                        <Eye size={11} className="text-[#A1B5CC]/50" />
                        <span>
                          Visualizada {activeProposal.viewed_count}x
                          {activeProposal.viewed_at && (
                            <> — última vez {formatInteractionDate(activeProposal.viewed_at)}</>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Send email */}
                    <button
                      type="button"
                      onClick={() => handleSendProposalEmail(activeProposal.slug)}
                      className="flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-150 hover:brightness-110 cursor-pointer"
                      style={{
                        color: '#60A5FA',
                        background: 'rgba(96,165,250,0.10)',
                        border: '1px solid rgba(96,165,250,0.20)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                      }}
                    >
                      <Mail size={13} />
                      Enviar por E-mail
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateProposal} className="space-y-3">
                    <input
                      type="text"
                      value={proposalForm.title}
                      onChange={e => setProposalForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Título da proposta"
                      className="w-full rounded-xl px-3 py-2 text-[13px] text-white placeholder-white/25 outline-none transition-all duration-150"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,101,0,0.50)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
                    />
                    <textarea
                      value={proposalForm.scope}
                      onChange={e => setProposalForm(f => ({ ...f, scope: e.target.value }))}
                      placeholder="Escopo — descreva as entregas do projeto..."
                      rows={4}
                      className="w-full rounded-xl px-3 py-2 text-[13px] text-white placeholder-white/25 outline-none resize-none transition-all duration-150"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,101,0,0.50)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-widest">
                          Valor (BRL)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={proposalForm.value}
                          onChange={e => setProposalForm(f => ({ ...f, value: formatCurrencyInput(e.target.value) }))}
                          placeholder="R$ 0,00"
                          className="w-full rounded-xl px-3 py-2 text-[13px] font-mono text-white placeholder-white/25 outline-none transition-all duration-150"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.10)',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,101,0,0.50)' }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-widest">
                          Validade (dias)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={proposalForm.validDays}
                          onChange={e => setProposalForm(f => ({ ...f, validDays: e.target.value }))}
                          className="w-full rounded-xl px-3 py-2 text-[13px] font-mono text-white outline-none transition-all duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.10)',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,101,0,0.50)' }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!proposalForm.title.trim() || isCreatingProposal}
                      className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                      style={{
                        background: isCreatingProposal ? 'rgba(255,101,0,0.55)' : 'linear-gradient(135deg, #FF6500 0%, #e85500 100%)',
                        boxShadow: isCreatingProposal ? 'none' : '0 2px 8px rgba(255,101,0,0.30), inset 0 1px 0 rgba(255,255,255,0.15)',
                      }}
                    >
                      {isCreatingProposal ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
                      Criar Proposta
                    </button>
                  </form>
                )}
              </div>

              </>
              )}

            </div>

              {/* ── Footer metadata ── */}
              <div className="px-6 py-4 border-t border-[#1E3E62]/20 flex items-center gap-2 text-[#A1B5CC]/50 text-[11px] font-mono shrink-0">
                <Calendar size={11} className="text-[#A1B5CC]/40" />
                <span>Criado em {formatDate(lead.created_at)}</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
