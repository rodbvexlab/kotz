import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { LeadCardOverlay } from './LeadCardOverlay'
import { COLUMNS } from '@/types/pipeline'
import type { Lead, LeadStatus, PipelineState, Column } from '@/types/pipeline'

interface KanbanBoardProps {
  state: PipelineState
  onMove: (leadId: string, from: LeadStatus, to: LeadStatus) => void
  onOpenLead: (lead: Lead) => void
  onAddLead: (name: string, status: Column['id']) => void
}

export function KanbanBoard({ state, onMove, onOpenLead, onAddLead }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }, // evita trigger em clicks normais
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Encontra o lead ativo pelo id
  const activeLead = activeId
    ? Object.values(state).flat().find(l => l.id === activeId) ?? null
    : null

  // Encontra em qual coluna um lead está
  function findColumn(leadId: string): LeadStatus | null {
    for (const [status, leads] of Object.entries(state)) {
      if (leads.find((l: Lead) => l.id === leadId)) return status as LeadStatus
    }
    return null
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id as string ?? null)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    setOverId(null)
    if (!over || active.id === over.id) return

    const from = findColumn(active.id as string)

    // destino pode ser uma coluna (id = LeadStatus) ou outro card
    const toColumn = COLUMNS.find(c => c.id === over.id)?.id
    const toViaCard = findColumn(over.id as string)
    const to = toColumn ?? toViaCard

    if (!from || !to || from === to) return
    onMove(active.id as string, from, to)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 items-start px-6 pb-6 overflow-x-auto min-h-full">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            leads={state[col.id]}
            isOver={overId === col.id || state[col.id].some(l => l.id === overId)}
            onOpenLead={onOpenLead}
            onAddLead={onAddLead}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        duration: 180,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeLead ? <LeadCardOverlay lead={activeLead} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
