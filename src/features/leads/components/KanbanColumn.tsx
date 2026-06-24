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

  const style: React.CSSProperties = {
    background: isDrop ? 'rgba(255,255,255,0.01)' : 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: isOver && !isDrop
      ? '1px solid rgba(255, 101, 0, 0.40)'
      : '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '14px',
    width: '256px',
    flexShrink: 0,
    opacity: isDrop ? 0.55 : 1,
    transition: 'border-color 200ms, background 200ms, opacity 200ms',
  }

  return (
    <div
      style={style}
      className="flex flex-col"
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
            className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border"
            style={{
              color: isDrop ? '#A1B5CC' : column.accent,
              backgroundColor: isDrop ? 'rgba(30, 62, 98, 0.10)' : `${column.accent}04`,
              borderColor: isDrop ? 'rgba(30, 62, 98, 0.20)' : `${column.accent}20`,
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

        {/* Empty state — ultra sutil, sem border-dashed */}
        {leads.length === 0 && !adding && (
          <div
            className="flex-1 flex items-center justify-center rounded-xl py-10 min-h-[80px] transition-all duration-200"
            style={{
              background: isOver && !isDrop
                ? 'rgba(255, 101, 0, 0.03)'
                : 'rgba(255, 255, 255, 0.01)',
              border: isOver && !isDrop
                ? '1px solid rgba(255, 101, 0, 0.15)'
                : '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            {isOver && !isDrop ? (
              <span className="text-[11px] font-mono text-[#FF6500]/50 tracking-wider">
                soltar aqui
              </span>
            ) : isDrop ? null : (
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
