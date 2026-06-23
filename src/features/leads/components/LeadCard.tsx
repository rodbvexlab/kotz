import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Instagram, MessageCircle, Users } from 'lucide-react'
import type { Lead } from '@/types/pipeline'

interface LeadCardProps {
  lead: Lead
  isDrop?: boolean
  onOpen: (lead: Lead) => void
}

const STATUS_COLOR: Record<string, string> = {
  novo:             '#1E3E62',
  em_contato:       '#FF6500',
  proposta_enviada: '#F59E0B',
  fechado:          '#22C55E',
  perdido:          '#52525B',
}

const channelIcon = (channel?: string | null) => {
  if (!channel) return null
  switch (channel) {
    case 'instagram':
      return <Instagram size={11} className="mr-0.5" />
    case 'whatsapp':
      return <MessageCircle size={11} className="mr-0.5" />
    case 'indicacao':
      return <Users size={11} className="mr-0.5" />
    default:
      return null
  }
}

const channelBadgeStyle = (channel?: string | null): React.CSSProperties => {
  const styles: Record<string, React.CSSProperties> = {
    instagram: { 
      background: 'rgba(244, 114, 182, 0.04)', 
      color: '#F472B6', 
      borderColor: 'rgba(244, 114, 182, 0.15)' 
    },
    whatsapp: { 
      background: 'rgba(74, 222, 128, 0.04)', 
      color: '#4ADE80', 
      borderColor: 'rgba(74, 222, 128, 0.15)' 
    },
    indicacao: { 
      background: 'rgba(96, 165, 250, 0.04)', 
      color: '#60A5FA', 
      borderColor: 'rgba(96, 165, 250, 0.15)' 
    },
    outro: { 
      background: 'rgba(30, 62, 98, 0.10)', 
      color: '#A1B5CC', 
      borderColor: 'rgba(30, 62, 98, 0.20)' 
    },
  }
  const base: React.CSSProperties = {
    fontSize: '9px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '2px 6px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center'
  }
  return { ...base, ...(channel ? styles[channel] : styles.outro) }
}

const channelLabel = (channel?: string | null): string => {
  const labels: Record<string, string> = {
    instagram: 'Instagram',
    whatsapp:  'WhatsApp',
    indicacao: 'Indicação',
    outro:     'Outro',
  }
  return channel ? labels[channel] : labels.outro
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

function avatarColor(name: string): string {
  const palette = ['#1E3E62', '#2a4a7f', '#FF6500', '#7c3aed', '#0891b2']
  return palette[name.charCodeAt(0) % palette.length]
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `há ${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return `há ${d}d`
}

export function LeadCard({ lead, isDrop = false, onOpen }: LeadCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const statusColor = STATUS_COLOR[lead.status] || '#1E3E62'

  const style: React.CSSProperties = {
    background: isHovered ? 'rgba(15, 32, 54, 0.50)' : 'rgba(11, 25, 44, 0.40)',
    backdropFilter: 'blur(20px) saturate(200%)',
    WebkitBackdropFilter: 'blur(20px) saturate(200%)',
    border: isHovered ? '1px solid rgba(255, 101, 0, 0.35)' : '1px solid rgba(30, 62, 98, 0.20)',
    borderLeft: `3px solid ${statusColor}`,
    borderRadius: '12px',
    boxShadow: isHovered 
      ? '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 12px rgba(255, 101, 0, 0.10)'
      : '0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
    padding: '14px',
    cursor: isDragging ? 'grabbing' : 'grab',
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
        'group relative overflow-hidden transition-all duration-200',
        isDragging ? 'drag-active' : '',
        isDrop ? 'opacity-50' : '',
      ].filter(Boolean).join(' ')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation()
          onOpen(lead)
        }
      }}
    >
      {/* Status indicator glow dot in top right */}
      <div 
        className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full transition-all duration-300"
        style={{ 
          backgroundColor: statusColor,
          boxShadow: isHovered ? `0 0 8px 2px ${statusColor}` : 'none'
        }} 
      />

      {/* TOP: Avatar + ID + Nome */}
      <div className="flex items-center gap-3">
        {/* Squircle Avatar with thin border */}
        <div 
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/10 transition-transform duration-300 group-hover:scale-105"
          style={{ background: avatarColor(lead.name) }}
        >
          {initials(lead.name)}
        </div>

        {/* Lead details */}
        <div className="flex-1 min-w-0 pr-2">
          <span className="block text-[8px] font-mono text-[#A1B5CC]/40 tracking-wider">
            #{lead.id.substring(0, 4).toUpperCase()}
          </span>
          <span className="block text-sm font-semibold text-white truncate leading-tight group-hover:text-[#FF6500] transition-colors duration-150">
            {lead.name}
          </span>
        </div>
      </div>

      {/* MIDDLE: Service capsule (Terminal command output style) */}
      {lead.service && (
        <div className="mt-2.5 pl-10">
          <div className="inline-flex items-center gap-1.5 bg-black/40 border border-[#1E3E62]/30 rounded px-2 py-0.5 max-w-full">
            <span className="text-[9px] font-mono text-[#FF6500]">&gt;</span>
            <span className="text-[11px] text-[#A1B5CC] truncate font-medium">
              {lead.service}
            </span>
          </div>
        </div>
      )}

      {/* Tech divider (Dashed) */}
      <div className="mt-3.5 border-t border-dashed border-[#1E3E62]/20" />

      {/* BOTTOM: Channel badge + time ago */}
      <div className="mt-3 flex items-center justify-between">
        {/* Notched tag style for channel */}
        <span style={channelBadgeStyle(lead.channel)}>
          {channelIcon(lead.channel)}
          {channelLabel(lead.channel)}
        </span>

        {/* Time ago with tiny code indicator dot */}
        <div className="flex items-center gap-1 text-[10px] font-mono text-[#A1B5CC]/50">
          <span className="w-1 h-1 rounded-full bg-[#1E3E62] group-hover:bg-[#FF6500] transition-colors duration-200" />
          <span>{timeAgo(lead.created_at)}</span>
        </div>
      </div>
    </div>
  )
}
