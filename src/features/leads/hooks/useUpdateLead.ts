import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import type { Lead, LeadStatus, LeadChannel } from '@/types/pipeline'

export interface UpdateLeadPayload {
  name: string
  service: string | null
  channel: LeadChannel | null
  contact: string | null
  notes: string | null
  status: LeadStatus
}

/**
 * Hook isolado para persistir atualizações de um lead no Supabase.
 * Retorna o lead salvo (com updated_at real do banco) ou lança em caso de erro.
 */
export function useUpdateLead() {
  const { tenant } = useTenant()

  const updateLead = useCallback(
    async (leadId: string, payload: UpdateLeadPayload): Promise<Lead> => {
      if (!tenant) throw new Error('Tenant não encontrado')

      const { data, error } = await supabase
        .from('leads')
        .update({
          name:       payload.name.trim(),
          service:    payload.service?.trim() || null,
          channel:    payload.channel,
          contact:    payload.contact?.trim() || null,
          notes:      payload.notes?.trim() || null,
          status:     payload.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .eq('tenant_id', tenant.id)   // isolamento de tenant garantido
        .select()
        .single()

      if (error) {
        console.error('[useUpdateLead] UPDATE error:', error)
        throw error
      }

      return data as Lead
    },
    [tenant]
  )

  return { updateLead }
}
