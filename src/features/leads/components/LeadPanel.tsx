import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { X, Instagram, MessageCircle, Users, Calendar, PlusCircle, Sparkles } from 'lucide-react'
import type { Lead } from '@/types/pipeline'

export interface LeadInteraction {
  id: string
  lead_id: string
  content: string
  created_at: string
}

interface LeadPanelProps {
  lead: Lead | null
  onClose: () => void
  interactions?: LeadInteraction[]
  onAddInteraction?: (content: string) => void | Promise<void>
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

function formatInteractionDate(iso: string) {
  const date = new Date(iso)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function LeadPanel({ lead, onClose, interactions: propsInteractions, onAddInteraction }: LeadPanelProps) {
  const [, setSearchParams] = useSearchParams()
  const open = !!lead

  const [newContent, setNewContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [localInteractions, setLocalInteractions] = useState<LeadInteraction[]>([])

  // Sincroniza interações locais com props e carrega dados padrão caso vazias
  useEffect(() => {
    if (!lead) return

    if (propsInteractions && propsInteractions.length > 0) {
      setLocalInteractions(propsInteractions)
      return
    }

    // Mock realista de interações caso nenhuma venha via props (MVP)
    const mockList: LeadInteraction[] = [
      {
        id: 'mock-1',
        lead_id: lead.id,
        content: `Lead qualificado para o serviço de ${lead.service || 'Design/Branding'}. Conversado sobre escopo do projeto.`,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // ontem
      },
      {
        id: 'mock-2',
        lead_id: lead.id,
        content: `Contato telefônico realizado. Demonstrou interesse no plano de branding e site institucional.`,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
      }
    ]
    setLocalInteractions(mockList)
  }, [lead, propsInteractions])

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

  const handleSaveInteraction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim() || !lead) return

    setIsSaving(true)
    try {
      if (onAddInteraction) {
        await onAddInteraction(newContent.trim())
      }
      
      const newAct: LeadInteraction = {
        id: Math.random().toString(36).substring(7),
        lead_id: lead.id,
        content: newContent.trim(),
        created_at: new Date().toISOString()
      }

      setLocalInteractions(prev => [newAct, ...prev])
      setNewContent('')
    } catch (err) {
      console.error('Erro ao salvar interação:', err)
    } finally {
      setIsSaving(false)
    }
  }

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
          'bg-[#0B192C] border-l border-[#1E3E62]/30',
          'flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.5)]',
          'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {lead && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#1E3E62]/20">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-bold text-white tracking-tight leading-tight">{lead.name}</h2>
                {lead.service && (
                  <p className="text-sm text-[#A1B5CC] mt-1 flex items-center gap-1.5 font-medium">
                    <Sparkles size={12} className="text-[#FF6500]" />
                    {lead.service}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A1B5CC] hover:text-white hover:bg-[#1E3E62]/20 transition-all shrink-0"
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    color: lead.status === 'novo' ? '#A1B5CC' : STATUS_COLOR[lead.status],
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
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#A1B5CC] bg-[#1E3E62]/10 border border-[#1E3E62]/20 px-3 py-1.5 rounded-full font-medium">
                    {CHANNEL_META[lead.channel]?.icon}
                    {CHANNEL_META[lead.channel]?.label}
                  </span>
                )}
              </div>

              {/* Contato */}
              {lead.contact && (
                <div className="bg-black/35 p-3 rounded-lg border border-[#1E3E62]/15">
                  <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider mb-1">Contato</p>
                  <p className="text-sm text-white font-mono">{lead.contact}</p>
                </div>
              )}

              {/* Notas */}
              <div>
                <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider mb-1.5">Observações do Lead</p>
                {lead.notes ? (
                  <p className="text-sm text-white/80 leading-relaxed bg-black/20 p-3 rounded-lg border border-[#1E3E62]/10 whitespace-pre-wrap">{lead.notes}</p>
                ) : (
                  <p className="text-sm text-[#A1B5CC]/40 italic">Nenhuma observação cadastrada.</p>
                )}
              </div>

              {/* Divisor */}
              <div className="h-px bg-[#1E3E62]/20" />

              {/* Nova Interação Inline */}
              <div>
                <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider mb-2">Registrar Nova Interação</p>
                <form onSubmit={handleSaveInteraction} className="relative group">
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="O que foi conversado com o lead? Pressione 'Salvar'..."
                    rows={3}
                    className="w-full text-sm bg-black border border-[#1E3E62]/40 focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]/25 rounded-lg p-3 text-white placeholder-[#A1B5CC]/40 outline-none resize-none transition-all duration-200"
                  />
                  
                  {/* Botão de Salvar Animado */}
                  <div className={`transition-all duration-300 ease-out overflow-hidden flex justify-end ${
                    newContent.trim() 
                      ? 'opacity-100 max-h-12 translate-y-0 mt-2' 
                      : 'opacity-0 max-h-0 -translate-y-2 pointer-events-none'
                  }`}>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-[#FF6500] hover:bg-[#FF6500]/90 text-white rounded-lg text-xs font-semibold shadow-md shadow-[#FF6500]/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <PlusCircle size={14} />
                      {isSaving ? 'Salvando...' : 'Salvar Interação'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Histórico — Timeline */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider">Histórico de Interações</p>
                
                {localInteractions.length === 0 ? (
                  <div className="rounded-xl border border-[#1E3E62]/15 bg-black/10 p-6 text-center">
                    <p className="text-xs text-[#A1B5CC]/40">Nenhuma interação registrada ainda.</p>
                  </div>
                ) : (
                  <div className="flex flex-col mt-4">
                    {localInteractions.map((item, idx) => {
                      const isNewest = idx === 0
                      return (
                        <div key={item.id} className="relative pl-6 pb-6 last:pb-0">
                          {/* Linha vertical conectando os nós */}
                          {idx !== localInteractions.length - 1 && (
                            <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-[#1E3E62]/20" />
                          )}
                          
                          {/* Nó visual da Timeline */}
                          <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-[#0B192C] ${
                            isNewest ? 'border-[#FF6500]' : 'border-[#1E3E62]/60'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isNewest ? 'bg-[#FF6500]' : 'bg-[#1E3E62]/60'
                            }`} />
                          </div>

                          {/* Data/Hora em JetBrains Mono */}
                          <span className="block text-[10px] font-mono text-[#A1B5CC]/70 tracking-tight">
                            {formatInteractionDate(item.created_at)}
                          </span>

                          {/* Conteúdo */}
                          <p className="text-sm text-white/95 mt-1 leading-relaxed whitespace-pre-wrap">
                            {item.content}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Footer — metadata */}
            <div className="px-6 py-4 border-t border-[#1E3E62]/20 flex items-center gap-2 text-[#A1B5CC]/50 text-xs font-mono">
              <Calendar size={12} className="text-[#A1B5CC]/40" />
              <span>Criado em {formatDate(lead.created_at)}</span>
            </div>
          </>
        )}
      </div>
    </>
  )
}

