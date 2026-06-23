import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, Plus } from 'lucide-react'
import { KanbanBoard } from './components/KanbanBoard'
import { LeadPanel } from './components/LeadPanel'
import { useLeadsSync } from './hooks/useLeadsSync'
import { useLeadInteractions } from './hooks/useLeadInteractions'
import { AppNav } from '@/components/layout/AppNav'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import type { Lead, LeadStatus } from '@/types/pipeline'

export function PipelinePage() {
  const { state, loading, error, handleMove, handleAddLead, handleUpdateLead } = useLeadsSync()
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [isNewLead, setIsNewLead] = useState(false)
  const [searchParams] = useSearchParams()

  const handleCreateLead = async (name: string, status: LeadStatus) => {
    const created = await handleAddLead(name, status)
    if (created) {
      setIsNewLead(true)
      setActiveLead(created)
    }
  }

  // Hook real de interações — conectado ao Supabase
  const {
    interactions,
    loading: loadingInteractions,
    addInteraction: onAddInteraction,
  } = useLeadInteractions(activeLead?.id ?? null)

  // Restaura panel se URL tiver ?leadId=
  useEffect(() => {
    const leadId = searchParams.get('leadId')
    if (!leadId) return
    const all = Object.values(state).flat()
    const found = all.find(l => l.id === leadId)
    if (found) setActiveLead(found)
  }, [searchParams, state])

  const activeCount = Object.values(state)
    .flat()
    .filter(l => !['fechado', 'perdido'].includes(l.status)).length

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="ds-spinner" />
          <p className="text-[#A1B5CC] text-xs font-mono">Carregando pipeline...</p>
        </div>
      </div>
    )
  }

  // ─── Erro ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <AlertCircle size={24} className="text-[#FF6500]" />
          <p className="text-white text-sm font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-[#A1B5CC]/50 hover:text-white transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav />

      {/* Pipeline header */}
      <div className="px-6 pt-6 pb-4 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline</h1>
          <p className="text-sm text-[#A1B5CC] mt-0.5">
            {activeCount} {activeCount === 1 ? 'lead ativo' : 'leads ativos'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={async () => {
              const created = await handleAddLead('Novo Lead', 'novo')
              if (created) {
                setIsNewLead(true)
                setActiveLead(created)
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #FF6500, #e85500)',
              boxShadow: '0 2px 12px rgba(255,101,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,101,0,0.40), inset 0 1px 0 rgba(255,255,255,0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(255,101,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)'
            }}
          >
            <Plus size={16} />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          state={state}
          onMove={handleMove}
          onOpenLead={(lead) => {
            setIsNewLead(false)
            setActiveLead(lead)
          }}
          onAddLead={handleCreateLead}
        />
      </div>

      {/* Slide-over */}
      <LeadPanel
        lead={activeLead}
        onClose={() => {
          setActiveLead(null)
          setIsNewLead(false)
        }}
        isNewLead={isNewLead}
        interactions={interactions}
        loadingInteractions={loadingInteractions}
        onAddInteraction={onAddInteraction}
        onUpdateLead={(updated) => {
          handleUpdateLead(updated)   // atualiza Kanban (move de coluna se status mudou)
          setActiveLead(updated)      // mantém panel sincronizado com novos dados
        }}
      />
    </div>
  )
}
