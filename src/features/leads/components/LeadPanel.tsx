import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { X, Instagram, MessageCircle, Users, Calendar } from 'lucide-react'
import type { Lead } from '@/types/pipeline'

interface LeadPanelProps {
  lead: Lead | null
  onClose: () => void
}

const CHANNEL_META = {
  instagram: { icon: <Instagram size={14} />, label: 'Instagram' },
  whatsapp:  { icon: <MessageCircle size={14} />, label: 'WhatsApp' },
  indicacao: { icon: <Users size={14} />, label: 'Indicação' },
  outro:     { icon: null, label: 'Outro' },
}

const STATUS_LABEL: Record<string, string> = {
  novo:             'Novo',
  em_contato:       'Em contato',
  proposta_enviada: 'Proposta enviada',
  fechado:          'Fechado',
  perdido:          'Perdido',
}

const STATUS_COLOR: Record<string, string> = {
  novo:             '#1E3E62',
  em_contato:       '#FF6500',
  proposta_enviada: '#F59E0B',
  fechado:          '#22C55E',
  perdido:          '#6B7280',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

export function LeadPanel({ lead, onClose }: LeadPanelProps) {
  const [, setSearchParams] = useSearchParams()
  const open = !!lead

  // Sync URL quando abre/fecha
  useEffect(() => {
    if (lead) {
      setSearchParams({ leadId: lead.id }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [lead, setSearchParams])

  // Fecha com Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          'fixed top-0 right-0 bottom-0 z-50 w-full max-w-[480px]',
          'bg-[#0B192C] border-l border-[#1E3E62]/30',
          'flex flex-col shadow-[−8px_0_40px_rgba(0,0,0,0.5)]',
          'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {lead && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#1E3E62]/20">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-semibold text-white leading-tight">{lead.name}</h2>
                {lead.service && (
                  <p className="text-sm text-[#1E3E62] mt-1">{lead.service}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1E3E62] hover:text-white hover:bg-[#1E3E62]/20 transition-all shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Status + Canal */}
              <div className="flex flex-wrap gap-2">
                {/* Status badge */}
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{
                    color: STATUS_COLOR[lead.status],
                    backgroundColor: `${STATUS_COLOR[lead.status]}18`,
                    border: `1px solid ${STATUS_COLOR[lead.status]}30`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR[lead.status] }}
                  />
                  {STATUS_LABEL[lead.status]}
                </span>

                {/* Canal */}
                {lead.channel && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#1E3E62] bg-[#1E3E62]/10 border border-[#1E3E62]/20 px-3 py-1.5 rounded-full">
                    {CHANNEL_META[lead.channel]?.icon}
                    {CHANNEL_META[lead.channel]?.label}
                  </span>
                )}
              </div>

              {/* Contato */}
              {lead.contact && (
                <div>
                  <p className="text-xs text-[#1E3E62] uppercase tracking-wider mb-1.5">Contato</p>
                  <p className="text-sm text-white">{lead.contact}</p>
                </div>
              )}

              {/* Notas */}
              <div>
                <p className="text-xs text-[#1E3E62] uppercase tracking-wider mb-1.5">Observações</p>
                {lead.notes ? (
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
                ) : (
                  <p className="text-sm text-[#1E3E62]/50 italic">Nenhuma observação ainda.</p>
                )}
              </div>

              {/* Divisor */}
              <div className="h-px bg-[#1E3E62]/20" />

              {/* Histórico — placeholder Fase 1 */}
              <div>
                <p className="text-xs text-[#1E3E62] uppercase tracking-wider mb-3">Histórico de interações</p>
                <div className="flex flex-col gap-2">
                  <div className="rounded-xl border border-[#1E3E62]/15 bg-[#112236]/50 p-4 text-center">
                    <p className="text-xs text-[#1E3E62]/50">Histórico será carregado do Supabase na Fase 2</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer — metadata */}
            <div className="px-6 py-4 border-t border-[#1E3E62]/20 flex items-center gap-2 text-[#1E3E62]/50 text-xs">
              <Calendar size={11} />
              <span>Criado em {formatDate(lead.created_at)}</span>
            </div>
          </>
        )}
      </div>
    </>
  )
}
