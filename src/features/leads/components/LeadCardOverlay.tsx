import type { Lead } from '@/types/pipeline'

interface LeadCardOverlayProps {
  lead: Lead
}

export function LeadCardOverlay({ lead }: LeadCardOverlayProps) {
  return (
    <div className="rounded-xl border border-[#FF6500]/60 bg-[#162d47] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)] scale-[1.03] rotate-1 cursor-grabbing w-64">
      <p className="text-sm font-medium text-white">{lead.name}</p>
      {lead.service && (
        <p className="text-xs text-[#1E3E62] mt-1 truncate">{lead.service}</p>
      )}
    </div>
  )
}
