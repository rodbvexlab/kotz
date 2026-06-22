import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, LogOut, AlertCircle } from 'lucide-react'
import { KanbanBoard } from './components/KanbanBoard'
import { LeadPanel } from './components/LeadPanel'
import { useLeadsSync } from './hooks/useLeadsSync'
import { useLeadInteractions } from './hooks/useLeadInteractions'
import { useTenant } from '@/lib/tenant'
import { useAuth } from '@/app/providers'
import type { Lead } from '@/types/pipeline'

export function PipelinePage() {
  const { state, loading, error, handleMove, handleAddLead } = useLeadsSync()
  const { tenant } = useTenant()
  const { signOut } = useAuth()
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [searchParams] = useSearchParams()

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-[#FF6500] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#1E3E62] text-sm">Carregando pipeline...</p>
        </div>
      </div>
    )
  }

  // ─── Erro ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <AlertCircle size={24} className="text-[#FF6500]" />
          <p className="text-white text-sm font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-[#1E3E62] hover:text-white transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">

      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1E3E62]/20 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Ko</span>
            <span className="text-[#FF6500]">tz</span>
          </span>
          <div className="h-4 w-px bg-[#1E3E62]/30" />
          <div className="flex items-center gap-1.5 text-sm text-white/70">
            <LayoutGrid size={14} className="text-[#FF6500]" />
            Pipeline
          </div>
        </div>

        <div className="flex items-center gap-3">
          {tenant && (
            <span className="text-xs text-[#1E3E62]">{tenant.name}</span>
          )}
          <button
            onClick={signOut}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1E3E62] hover:text-white hover:bg-[#1E3E62]/20 transition-all"
            title="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Pipeline header */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline</h1>
        <p className="text-sm text-[#1E3E62] mt-0.5">
          {activeCount} {activeCount === 1 ? 'lead ativo' : 'leads ativos'}
        </p>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          state={state}
          onMove={handleMove}
          onOpenLead={setActiveLead}
          onAddLead={handleAddLead}
        />
      </div>

      {/* Slide-over */}
      <LeadPanel
        lead={activeLead}
        onClose={() => setActiveLead(null)}
        interactions={interactions}
        loadingInteractions={loadingInteractions}
        onAddInteraction={onAddInteraction}
      />
    </div>
  )
}
