import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import { toast } from 'sonner'
import type { Proposal, WorkspaceSettings } from '@/types/database'

function generateSlug(len = 7): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  let slug = ''
  const arr = crypto.getRandomValues(new Uint8Array(len))
  for (let i = 0; i < len; i++) slug += chars[arr[i] % chars.length]
  return slug
}

interface CreateProposalData {
  lead_id: string
  title: string
  scope?: string | null
  value?: number | null
  valid_until?: string | null
}

export function useProposals(leadId?: string | null) {
  const { tenant } = useTenant()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchProposals = useCallback(async () => {
    if (!tenant?.id) return
    setIsLoading(true)
    const query = supabase
      .from('proposals')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false })

    if (leadId) query.eq('lead_id', leadId)

    const { data, error } = await query
    if (error) {
      console.error('[useProposals] fetch error:', error)
    } else {
      setProposals(data ?? [])
    }
    setIsLoading(false)
  }, [tenant?.id, leadId])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  const createProposal = useCallback(async (input: CreateProposalData): Promise<Proposal | null> => {
    if (!tenant?.id) return null

    const slug = generateSlug()
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        tenant_id: tenant.id,
        lead_id: input.lead_id,
        title: input.title,
        scope: input.scope ?? null,
        value: input.value ?? null,
        valid_until: input.valid_until ?? null,
        slug,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('[useProposals] create error:', error)
      toast.error('Erro ao criar proposta', {
        description: error.message,
        className: 'glass-card',
      })
      return null
    }

    toast.success('Proposta criada', {
      description: 'Link público gerado com sucesso.',
      className: 'glass-card',
    })
    await fetchProposals()
    return data
  }, [tenant?.id, fetchProposals])

  const updateProposalStatus = useCallback(async (id: string, status: string) => {
    const { error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error('Erro ao atualizar status', {
        description: error.message,
        className: 'glass-card',
      })
      return
    }
    await fetchProposals()
  }, [fetchProposals])

  return {
    proposals,
    isLoading,
    createProposal,
    updateProposalStatus,
    refetch: fetchProposals,
  }
}

export async function getProposalBySlug(slug: string): Promise<{
  proposal: Proposal
  settings: WorkspaceSettings | null
} | null> {
  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !proposal) return null

  const { data: settings } = await supabase
    .from('workspace_settings')
    .select('*')
    .eq('tenant_id', proposal.tenant_id)
    .single()

  return { proposal, settings: settings ?? null }
}

export async function incrementProposalView(slug: string): Promise<void> {
  try {
    await supabase.rpc('increment_proposal_view', { p_slug: slug })
  } catch {
    // non-critical — fire and forget
  }
}

export async function acceptProposal(slug: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('accept_proposal', { p_slug: slug })

  if (error) {
    return { success: false, error: error.message }
  }

  const result = data as { success?: boolean; error?: string } | null
  if (result && result.success === false) {
    return { success: false, error: result.error ?? 'Erro desconhecido' }
  }

  return { success: true }
}
