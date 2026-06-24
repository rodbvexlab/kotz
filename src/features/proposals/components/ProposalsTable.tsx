import { Sparkles, FileText, ExternalLink, Calendar } from 'lucide-react'
import type { ProposalWithLead } from '../hooks/useProposals'
import { Link } from 'react-router-dom'

interface Props {
  proposals: ProposalWithLead[]
  onRowClick: (proposal: ProposalWithLead) => void
}

const statusMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: 'Rascunho', color: '#A1B5CC', bg: 'rgba(161,181,204,0.1)', border: 'rgba(161,181,204,0.2)' },
  sent: { label: 'Enviada', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
  viewed: { label: 'Visualizada', color: '#FF6500', bg: 'rgba(255,101,0,0.1)', border: 'rgba(255,101,0,0.2)' },
  accepted: { label: 'Aceita', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)' },
  declined: { label: 'Recusada', color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
}

export function ProposalsTable({ proposals, onRowClick }: Props) {
  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass-card border-dashed">
        <div className="w-12 h-12 rounded-full bg-[#1E3E62]/30 flex items-center justify-center mb-4">
          <FileText className="text-[#A1B5CC]" size={24} />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Nenhuma proposta criada</h3>
        <p className="text-sm text-[#A1B5CC] max-w-sm">
          Você ainda não gerou propostas. Crie a primeira diretamente a partir de um Lead no seu Pipeline.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[#1E3E62]/30 bg-[#0B192C]/50">
              <th className="px-6 py-4 text-xs font-semibold text-[#A1B5CC] uppercase tracking-wider">Título</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#A1B5CC] uppercase tracking-wider">Cliente (Lead)</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#A1B5CC] uppercase tracking-wider">Valor</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#A1B5CC] uppercase tracking-wider">Validade</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#A1B5CC] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#A1B5CC] uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E3E62]/20">
            {proposals.map((proposal) => {
              const statusMeta = statusMap[proposal.status] || statusMap.draft
              const formattedValue = proposal.value 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.value)
                : '—'
                
              const isViewed = proposal.status === 'viewed'

              return (
                <tr 
                  key={proposal.id} 
                  onClick={() => onRowClick(proposal)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1E3E62]/30 flex items-center justify-center border border-[#1E3E62]/50">
                        <FileText size={14} className="text-[#A1B5CC] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-white">{proposal.title}</span>
                        <span className="block text-xs text-[#A1B5CC] mt-0.5">
                          {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(proposal.created_at))}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#A1B5CC] group-hover:text-white transition-colors">
                    {proposal.leads?.name || 'Cliente desconhecido'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-white">{formattedValue}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-[#A1B5CC]">
                      <Calendar size={14} />
                      {proposal.valid_until ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(proposal.valid_until)) : 'Vitalícia'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase border"
                      style={{
                        backgroundColor: statusMeta.bg,
                        borderColor: statusMeta.border,
                        color: statusMeta.color,
                      }}
                    >
                      {isViewed && <Sparkles size={12} className="animate-pulse" />}
                      {statusMeta.label}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/p/${proposal.slug}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E3E62]/30 text-[#A1B5CC] hover:text-white hover:bg-[#1E3E62]/50 border border-[#1E3E62]/50 transition-all hover:scale-105"
                      title="Ver Proposta Pública"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
