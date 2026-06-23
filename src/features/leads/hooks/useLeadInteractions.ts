import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import { toast } from 'sonner'
import type { LeadInteraction, InteractionType } from '@/types/database'

export function useLeadInteractions(leadId: string | null) {
  const { tenant } = useTenant()
  const [interactions, setInteractions] = useState<LeadInteraction[]>([])
  const [loading, setLoading] = useState(false)

  const fetchInteractions = useCallback(async () => {
    if (!leadId || !tenant) return
    setLoading(true)
    const { data, error } = await supabase
      .from('lead_interactions')
      .select('*')
      .eq('lead_id', leadId)
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Erro ao carregar histórico', { description: error.message })
    } else {
      setInteractions((data as LeadInteraction[]) ?? [])
    }
    setLoading(false)
  }, [leadId, tenant])

  useEffect(() => {
    fetchInteractions()
  }, [fetchInteractions])

  const addInteraction = useCallback(async (
    content: string,
    type: InteractionType = 'note',
  ) => {
    if (!leadId || !tenant) return

    const { data: { user } } = await supabase.auth.getUser()

    const optimistic: LeadInteraction = {
      id: `temp_${Date.now()}`,
      lead_id: leadId,
      tenant_id: tenant.id,
      type,
      content,
      created_by: user?.id ?? null,
      created_at: new Date().toISOString(),
    }
    setInteractions(prev => [optimistic, ...prev])

    const { data, error } = await supabase
      .from('lead_interactions')
      .insert({
        lead_id: leadId,
        tenant_id: tenant.id,
        type,
        content,
        created_by: user?.id ?? null,
      })
      .select()
      .single()

    if (error) {
      setInteractions(prev => prev.filter(i => i.id !== optimistic.id))
      toast.error('Erro ao salvar interação', { description: error.message })
      return
    }

    if (data) {
      setInteractions(prev =>
        prev.map(i => i.id === optimistic.id ? (data as LeadInteraction) : i),
      )
      toast.success('Interação registrada')
    }
  }, [leadId, tenant])

  return { interactions, loading, addInteraction, refetch: fetchInteractions }
}
