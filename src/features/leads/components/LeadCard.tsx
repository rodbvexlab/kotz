import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Instagram, MessageCircle, Users } from 'lucide-react'
import type { Lead } from '@/types/pipeline'

interface LeadCardProps {
  lead: Lead
  isDrop?: boolean
  onOpen: (lead: Lead) => void
}

const CHANNEL_ICON = {
  instagram:  <Instagram size={14} />,
  whatsapp:   <MessageCircle size={14} />,
  indicacao:  <Users size={14} />,
  outro:      null,
}

const CHANNEL_LABEL = {
  instagram: 'Instagram',
  whatsapp:  'WhatsApp',
  indicacao: 'Indicação',
  outro:     'Outro',
}

const STATUS_COLOR: Record<string, string> = {
  novo:             '#1E3E62',
  em_contato:       '#FF6500',
  proposta_enviada: '#F59E0B',
  fechado:          '#22C55E',
  perdido:          '#6B7280',
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function getAvatarBg(name: string) {
  const colors = ['#FF6500', '#1E3E62', '#2a4a7f', '#7c3aed']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return diffMins <= 1 ? 'agora' : `há ${diffMins}m`
    }
    return `há ${diffHours}h`
  }
  if (diffDays === 1) return 'ontem'
  return `há ${diffDays}d`
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
    borderLeft: `2px solid ${STATUS_COLOR[lead.status]}`,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={[
        'group relative p-4 cursor-grab active:cursor-grabbing select-none',
        'glass-card',
        isDragging ? 'drag-active' : '',
        isDrop ? 'opacity-60' : '',
      ].join(' ')}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation()
          onOpen(lead)
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/15"
            style={{ backgroundColor: getAvatarBg(lead.name) }}
          >
            {getInitials(lead.name)}
          </div>
          {/* Nome */}
          <span className="text-sm font-semibold text-white truncate leading-tight">
            {lead.name}
          </span>
        </div>
        {/* Icon canal */}
        {lead.channel && (
          <span className="text-[#A1B5CC]/70 shrink-0">
            {CHANNEL_ICON[lead.channel]}
          </span>
        )}
      </div>

      {/* Serviço de interesse */}
      {lead.service && (
        <p className="text-xs text-[#A1B5CC] mt-2 truncate pl-9">
          {lead.service}
        </p>
      )}

      {/* Footer: badge canal + time ago */}
      <div className="flex items-center justify-between mt-3 pl-9">
        {lead.channel ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#A1B5CC] bg-[#1E3E62]/10 border border-[#1E3E62]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {CHANNEL_LABEL[lead.channel]}
          </span>
        ) : (
          <span />
        )}
        <span className="text-[10px] font-mono text-[#A1B5CC]/60">
          {timeAgo(lead.created_at)}
        </span>
      </div>
    </div>
  )
}
