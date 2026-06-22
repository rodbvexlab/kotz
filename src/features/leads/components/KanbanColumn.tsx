import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { LeadCard } from './LeadCard'
import { InlineAddLead } from './InlineAddLead'
import type { Lead, Column } from '@/types/pipeline'

interface KanbanColumnProps {
  column: Column
  leads: Lead[]
  isOver?: boolean
  onOpenLead: (lead: Lead) => void
  onAddLead: (name: string, status: Column['id']) => void
}

export function KanbanColumn({ column, leads, isOver, onOpenLead, onAddLead }: KanbanColumnProps) {
  const [adding, setAdding] = useState(false)
  const { setNodeRef } = useDroppable({ id: column.id })

  const isDrop = column.isDrop

  return (
    <div
      className={[
        'flex flex-col rounded-2xl border transition-all duration-200 w-64 shrink-0',
        isDrop
          ? 'bg-[#060f1a]/80 border-[#1E3E62]/15 opacity-70'
          : 'bg-[#0B192C] border-[#1E3E62]/25',
        isOver && !isDrop
          ? 'border-[#FF6500]/50 shadow-[0_0_0_1px_#FF650030] bg-[#0d1f33]'
          : '',
        isOver && isDrop
          ? 'border-[#1E3E62]/50 opacity-90'
          : '',
      ].join(' ')}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className={[
            'text-xs font-semibold uppercase tracking-widest',
            isDrop ? 'text-white/30' : 'text-white/70',
          ].join(' ')}>
            {column.label}
          </span>
          <span
            className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md"
            style={{
              color: isDrop ? '#6B7280' : column.accent,
              backgroundColor: isDrop ? '#6B728015' : `${column.accent}18`,
            }}
          >
            {leads.length}
          </span>
        </div>

        {/* Botão + Lead — só em colunas ativas */}
        {!isDrop && (
          <button
            onClick={() => setAdding(true)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-[#1E3E62] hover:text-[#FF6500] hover:bg-[#FF6500]/10 transition-all duration-150"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Divisor */}
      <div
        className="mx-4 mb-3 h-px"
        style={{
          background: isDrop
            ? 'rgba(30,62,98,0.15)'
            : `linear-gradient(to right, ${column.accent}40, transparent)`,
        }}
      />

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-2 px-3 pb-3 min-h-[120px] overflow-y-auto max-h-[calc(100vh-220px)]"
      >
        <SortableContext
          items={leads.map(l => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              isDrop={isDrop}
              onOpen={onOpenLead}
            />
          ))}
        </SortableContext>

        {/* Inline Add */}
        {adding && (
          <InlineAddLead
            onAdd={(name) => {
              onAddLead(name, column.id)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {/* Empty state */}
        {leads.length === 0 && !adding && (
          <div className={[
            'flex-1 flex items-center justify-center rounded-xl border-2 border-dashed py-8 min-h-[80px]',
            isDrop
              ? 'border-[#1E3E62]/10 text-[#1E3E62]/20'
              : isOver
                ? 'border-[#FF6500]/30 text-[#FF6500]/40'
                : 'border-[#1E3E62]/15 text-[#1E3E62]/30',
          ].join(' ')}>
            <span className="text-xs">
              {isOver ? 'Soltar aqui' : isDrop ? '—' : 'Sem leads'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
