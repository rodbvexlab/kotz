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
      return <Instagram size={13} style={{ color: '#A1B5CC' }} />
    case 'whatsapp':
      return <MessageCircle size={13} style={{ color: '#A1B5CC' }} />
    case 'indicacao':
      return <Users size={13} style={{ color: '#A1B5CC' }} />
    default:
      return null
  }
}

const channelBadgeStyle = (channel?: string | null): React.CSSProperties => {
  const styles: Record<string, React.CSSProperties> = {
    instagram: { background: 'rgba(244,114,182,0.10)', color: '#F472B6' },
    whatsapp:  { background: 'rgba(74,222,128,0.10)',  color: '#4ADE80' },
    indicacao: { background: 'rgba(96,165,250,0.10)',  color: '#60A5FA' },
    outro:     { background: 'rgba(30,62,98,0.20)',    color: '#A1B5CC' },
  }
  const base: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '2px 8px',
    borderRadius: '9999px',
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
  return name.split(' ').slice(0,2).map(w => w[0]?.toUpperCase()).join('')
}

function avatarColor(name: string): string {
  const palette = ['#1E3E62','#2a4a7f','#FF6500','#7c3aed','#0891b2']
  return palette[name.charCodeAt(0) % palette.length]
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff/60000)
  if (m < 1) return 'agora'
  if (m < 60) return `há ${m}min`
  const h = Math.floor(m/60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h/24)
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
    background: 'rgba(11, 25, 44, 0.40)',
    backdropFilter: 'blur(20px) saturate(200%)',
    WebkitBackdropFilter: 'blur(20px) saturate(200%)',
    border: isHovered ? '1px solid rgba(255,101,0,0.25)' : '1px solid rgba(255,255,255,0.09)',
    borderLeft: `3px solid ${statusColor}`,
    borderRadius: '12px',
    boxShadow: isHovered 
      ? '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,101,0,0.08)'
      : '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
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
        isDragging ? 'drag-active' : '',
        isDrop ? 'opacity-60' : '',
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
      {/* LINHA 1 — Avatar + Nome + Ícone canal */}
      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
        {/* Avatar com iniciais */}
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: avatarColor(lead.name),
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700, color: 'white',
          flexShrink: 0,
          fontFamily: 'Inter, sans-serif'
        }}>
          {initials(lead.name)}
        </div>

        {/* Nome */}
        <span style={{
          fontSize: '14px', fontWeight: 600, color: 'white',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {lead.name}
        </span>

        {/* Canal icon */}
        {channelIcon(lead.channel)}
      </div>

      {/* LINHA 2 — Serviço */}
      {lead.service && (
        <p style={{
          fontSize: '12px', color: '#A1B5CC',
          marginTop: '8px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {lead.service}
        </p>
      )}

      {/* LINHA 3 — Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginTop: '12px'
      }}>
        {/* Badge canal */}
        <span style={channelBadgeStyle(lead.channel)}>
          {channelLabel(lead.channel)}
        </span>

        {/* Time ago */}
        <span style={{
          fontSize: '10px', color: 'rgba(30,62,98,0.8)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {timeAgo(lead.created_at)}
        </span>
      </div>
    </div>
  )
}
