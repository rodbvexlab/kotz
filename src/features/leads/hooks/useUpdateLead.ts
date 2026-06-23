import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import type { Lead, LeadStatus, LeadChannel } from '@/types/pipeline'

export interface CompanyPayload {
  name: string
  document?: string | null
  industry?: string | null
  website?: string | null
}

export interface ContactPayload {
  name: string
  email?: string | null
  phone?: string | null
  role?: string | null
}

export interface UpdateLeadPayload {
  name: string
  service: string | null
  channel: LeadChannel | null
  contact: string | null
  notes: string | null
  status: LeadStatus
  company?: CompanyPayload | null
  contactPerson?: ContactPayload | null
}

export function useUpdateLead() {
  const { tenant } = useTenant()

  const updateLead = useCallback(
    async (leadId: string, payload: UpdateLeadPayload): Promise<Lead> => {
      if (!tenant) throw new Error('Tenant não encontrado')

      let company_id: string | null = null
      let contact_id: string | null = null

      // Upsert company if provided
      if (payload.company?.name?.trim()) {
        const companyData = {
          tenant_id: tenant.id,
          name: payload.company.name.trim(),
          document: payload.company.document?.trim() || null,
          industry: payload.company.industry?.trim() || null,
          website: payload.company.website?.trim() || null,
        }

        // Check if lead already has a company_id — update it; otherwise insert
        const { data: currentLead } = await supabase
          .from('leads')
          .select('company_id')
          .eq('id', leadId)
          .single()

        if (currentLead?.company_id) {
          const { data } = await supabase
            .from('companies')
            .update(companyData)
            .eq('id', currentLead.company_id)
            .select('id')
            .single()
          company_id = data?.id ?? currentLead.company_id
        } else {
          const { data } = await supabase
            .from('companies')
            .insert(companyData)
            .select('id')
            .single()
          company_id = data?.id ?? null
        }
      }

      // Upsert contact if provided
      if (payload.contactPerson?.name?.trim()) {
        const contactData = {
          tenant_id: tenant.id,
          company_id,
          name: payload.contactPerson.name.trim(),
          email: payload.contactPerson.email?.trim() || null,
          phone: payload.contactPerson.phone?.trim() || null,
          role: payload.contactPerson.role?.trim() || null,
        }

        const { data: currentLead } = await supabase
          .from('leads')
          .select('contact_id')
          .eq('id', leadId)
          .single()

        if (currentLead?.contact_id) {
          const { data } = await supabase
            .from('contacts')
            .update(contactData)
            .eq('id', currentLead.contact_id)
            .select('id')
            .single()
          contact_id = data?.id ?? currentLead.contact_id
        } else {
          const { data } = await supabase
            .from('contacts')
            .insert(contactData)
            .select('id')
            .single()
          contact_id = data?.id ?? null
        }
      }

      // Update the lead itself
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
          company_id,
          contact_id,
        })
        .eq('id', leadId)
        .eq('tenant_id', tenant.id)
        .select()
        .single()

      if (error) {
        console.error('[useUpdateLead] UPDATE error:', error)
        throw error
      }

      return data as Lead
    },
    [tenant],
  )

  return { updateLead }
}
