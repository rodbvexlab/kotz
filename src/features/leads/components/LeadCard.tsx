import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Instagram, MessageCircle, Users, ChevronRight } from 'lucide-react'
import type { Lead } from '@/types/pipeline'

interface LeadCardProps {
  lead: Lead
  isDrop?: boolean
  onOpen: (lead: Lead) => void
}

const CHANNEL_ICON = {
  instagram:  <Instagram  size={12} />,
  whatsapp:   <MessageCircle size={12} />,
  indicacao:  <Users size={12} />,
  outro:      null,
}

const CHANNEL_LABEL = {
  instagram: 'Instagram',
  whatsapp:  'WhatsApp',
  indicacao: 'Indicação',
  outro:     'Outro',
}

export function LeadCard({ lead, isDrop = false, onOpen }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={[
        'group relative rounded-xl border p-4 cursor-grab active:cursor-grabbing select-none',
        'transition-all duration-150',
        isDragging
          ? 'opacity-40 scale-[0.98] border-[#FF6500]/40 bg-[#162d47] shadow-2xl'
          : isDrop
            ? 'bg-[#0d1f33]/60 border-[#1E3E62]/20 hover:border-[#1E3E62]/50'
            : 'bg-[#112236] border-[#1E3E62]/30 hover:border-[#FF6500]/60 hover:shadow-[0_0_0_1px_#FF650020]',
      ].join(' ')}
      onClick={(e) => {
        // não abre ao terminar drag
        if (!isDragging) { e.stopPropagation(); onOpen(lead) }
      }}
    >
      {/* Nome */}
      <div className="flex items-start justify-between gap-2">
        <p className={[
          'text-sm font-medium leading-snug',
          isDrop ? 'text-white/50' : 'text-white',
        ].join(' ')}>
          {lead.name}
        </p>
        <ChevronRight
          size={14}
          className="shrink-0 mt-0.5 text-[#1E3E62] opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Serviço */}
      {lead.service && (
        <p className={[
          'text-xs mt-1 truncate',
          isDrop ? 'text-white/30' : 'text-[#1E3E62]',
        ].join(' ')}>
          {lead.service}
        </p>
      )}

      {/* Footer — canal + data */}
      {!isDrop && lead.channel && (
        <div className="flex items-center gap-1.5 mt-3">
          <span className="flex items-center gap-1 text-[10px] text-[#1E3E62] bg-[#1E3E62]/10 px-2 py-0.5 rounded-full">
            {CHANNEL_ICON[lead.channel]}
            {CHANNEL_LABEL[lead.channel]}
          </span>
        </div>
      )}

      {/* Hover: borda laranja sutil na esquerda */}
      {!isDrop && (
        <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-[#FF6500] opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  )
}
