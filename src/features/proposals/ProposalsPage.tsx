import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { FileText, TrendingUp } from 'lucide-react'
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard'
import { ProposalsTable } from './components/ProposalsTable'
import { useProposals, type ProposalWithLead } from './hooks/useProposals'
import { LeadPanel } from '@/features/leads/components/LeadPanel'
import { useLeadInteractions } from '@/features/leads/hooks/useLeadInteractions'
import type { Lead } from '@/types/pipeline'
import { supabase } from '@/lib/supabase'

export function ProposalsPage() {
  const { proposals, isLoading } = useProposals()
  
  // Modals / Panels state
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  // Fetch interactions when activeLead is present
  const { interactions, loading: loadingInteractions, addInteraction } = useLeadInteractions(activeLead?.id || null)

  const handleRowClick = async (proposal: ProposalWithLead) => {
    // Ao clicar na proposta, precisamos buscar os dados do lead_id correspondente
    // para alimentar o LeadPanel
    const { data: leadData, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', proposal.lead_id)
      .single()

    if (!error && leadData) {
      setActiveLead(leadData as Lead)
    }
  }

  const { openAmount, conversionRate } = useMemo(() => {
    let openValue = 0
    let acceptedCount = 0
    let closedCount = 0

    proposals.forEach(p => {
      if (['draft', 'sent', 'viewed'].includes(p.status)) {
        openValue += (p.value || 0)
      }
      if (p.status === 'accepted') {
        acceptedCount++
        closedCount++
      }
      if (p.status === 'declined') {
        closedCount++
      }
    })

    const rate = closedCount > 0 ? (acceptedCount / closedCount) * 100 : 0

    return {
      openAmount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(openValue),
      conversionRate: rate.toFixed(1) + '%'
    }
  }, [proposals])

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative z-10 text-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Propostas</h1>
          <p className="text-sm text-[#A1B5CC]">Gerencie as propostas comerciais do seu funil e acompanhe a conversão.</p>
        </header>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LiquidGlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText size={64} className="text-[#FF6500]" />
            </div>
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-sm font-medium text-[#A1B5CC]">Propostas em Aberto</span>
              <span className="text-3xl font-bold tracking-tight text-white">
                {openAmount}
              </span>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={64} className="text-[#4ADE80]" />
            </div>
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-sm font-medium text-[#A1B5CC]">Taxa de Conversão</span>
              <span className="text-3xl font-bold tracking-tight text-[#4ADE80]">
                {conversionRate}
              </span>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Table */}
        <section>
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="ds-spinner" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProposalsTable proposals={proposals} onRowClick={handleRowClick} />
            </motion.div>
          )}
        </section>

      </div>

      {/* Lead Panel (Slide-over) */}
      <LeadPanel
        lead={activeLead}
        onClose={() => setActiveLead(null)}
        initialTab="propostas"
        interactions={interactions}
        loadingInteractions={loadingInteractions}
        onAddInteraction={addInteraction}
        onUpdateLead={(updated) => {
          setActiveLead(updated)
        }}
      />
    </div>
  )
}
