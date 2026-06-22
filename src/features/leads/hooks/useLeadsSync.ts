import { useEffect, useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import { usePipeline } from './usePipeline'
import type { Lead, LeadStatus } from '@/types/pipeline'

export function useLeadsSync() {
  const { tenant, loading: tenantLoading } = useTenant()
  const { state, init, moveCard, addLead, updateLead } = usePipeline()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ─── 1. Carrega leads do Supabase ─────────────────────────────────────────
  useEffect(() => {
    if (!tenant) return

    async function fetchLeads() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Erro ao carregar leads.')
        console.error('[useLeadsSync] fetch error:', error)
      } else {
        init((data as Lead[]) ?? [])
      }

      setLoading(false)
    }

    fetchLeads()
  }, [tenant, init])

  // ─── 2. Move card com persist real ────────────────────────────────────────
  const handleMove = useCallback(
    (leadId: string, from: LeadStatus, to: LeadStatus) => {
      moveCard(leadId, from, to, async (id, status) => {
        const { error } = await supabase
          .from('leads')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('tenant_id', tenant?.id ?? '')  // garante isolamento mesmo client-side

        if (error) console.error('[useLeadsSync] move error:', error)
        return { error }
      })
    },
    [moveCard, tenant]
  )

  // ─── 3. Cria lead inline com tenant_id real ───────────────────────────────
  const handleAddLead = useCallback(
    async (name: string, status: LeadStatus) => {
      if (!tenant) return

      // ID temporário para optimistic UI imediato
      const tempId = `temp_${Date.now()}`
      const optimistic: Lead = {
        id: tempId,
        tenant_id: tenant.id,
        name,
        channel: null,
        contact: null,
        service: null,
        status,
        notes: null,
        assigned_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // UI atualiza imediatamente
      addLead(optimistic)

      // Persiste no banco
      const { data, error } = await supabase
        .from('leads')
        .insert({
          tenant_id: tenant.id,
          name,
          status,
        })
        .select()
        .single()

      if (error) {
        console.error('[useLeadsSync] insert error:', error)
        // Rollback: remove o lead otimista
        // (strategy: re-fetch completo para garantir consistência)
        const { data: fresh } = await supabase
          .from('leads')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })

        if (fresh) init(fresh as Lead[])
        return
      }

      // Substitui o lead temporário pelo real (com UUID do banco)
      if (data) {
        updateLead({ ...optimistic, id: data.id })
      }
    },
    [tenant, addLead, updateLead, init]
  )

  return {
    state,
    loading: tenantLoading || loading,
    error,
    handleMove,
    handleAddLead,
  }
}
