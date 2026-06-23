export type LeadStatus =
  | 'novo'
  | 'em_contato'
  | 'proposta_enviada'
  | 'fechado'
  | 'perdido'

export type LeadChannel = 'instagram' | 'whatsapp' | 'indicacao' | 'outro'

export interface Lead {
  id: string
  tenant_id: string
  name: string
  channel: LeadChannel | null
  contact: string | null
  service: string | null
  status: LeadStatus
  notes: string | null
  assigned_to: string | null
  company_id: string | null
  contact_id: string | null
  created_at: string
  updated_at: string
}

export interface Column {
  id: LeadStatus
  label: string
  accent: string      // cor do badge/counter
  isDrop: boolean     // true = drop zone final (Fechado/Perdido)
}

export const COLUMNS: Column[] = [
  { id: 'novo',             label: 'Novo',             accent: '#1E3E62', isDrop: false },
  { id: 'em_contato',       label: 'Em contato',       accent: '#FF6500', isDrop: false },
  { id: 'proposta_enviada', label: 'Proposta enviada', accent: '#F59E0B', isDrop: false },
  { id: 'fechado',          label: 'Fechado',          accent: '#22C55E', isDrop: true  },
  { id: 'perdido',          label: 'Perdido',          accent: '#6B7280', isDrop: true  },
]

export type PipelineState = Record<LeadStatus, Lead[]>

export type PipelineAction =
  | { type: 'INIT'; payload: Lead[] }
  | { type: 'MOVE_CARD'; leadId: string; from: LeadStatus; to: LeadStatus }
  | { type: 'ROLLBACK'; snapshot: PipelineState }
  | { type: 'ADD_LEAD'; lead: Lead }
  | { type: 'UPDATE_LEAD'; lead: Lead }
