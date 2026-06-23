import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import type { LeadInteraction } from '@/types/database'

export function useLeadInteractions(leadId: string | null) {
  const { tenant } = useTenant()
  const [interactions, setInteractions] = useState<LeadInteraction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!leadId || !tenant) return
    async function fetchInteractions() {
      setLoading(true)
      const { data } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('lead_id', leadId!)
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false })
      setInteractions((data as LeadInteraction[]) ?? [])
      setLoading(false)
    }
    fetchInteractions()
  }, [leadId, tenant])

  const addInteraction = useCallback(async (note: string) => {
    if (!leadId || !tenant) return
    const { data: { user } } = await supabase.auth.getUser()
    const optimistic: LeadInteraction = {
      id: `temp_${Date.now()}`,
      tenant_id: tenant.id,
      lead_id: leadId,
      user_id: user?.id ?? null,
      note,
      created_at: new Date().toISOString(),
    }
    setInteractions(prev => [optimistic, ...prev])
    const { data, error } = await supabase
      .from('lead_interactions')
      .insert({
        tenant_id: tenant.id,
        lead_id: leadId,
        user_id: user?.id ?? null,
        note,
      })
      .select()
      .single()
    if (error) {
      setInteractions(prev => prev.filter(i => i.id !== optimistic.id))
      return
    }
    if (data) {
      setInteractions(prev =>
        prev.map(i => i.id === optimistic.id
          ? data as LeadInteraction : i)
      )
    }
  }, [leadId, tenant])

  return { interactions, loading, addInteraction }
}
