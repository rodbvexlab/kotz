import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import type { Lead } from '@/types/pipeline'
import type {
  MessageTemplate,
  MessageTemplateCategory,
} from '@/types/database'

// ─── Category ordering ───────────────────────────────────────────────────────

export const CATEGORY_META: Record<
  MessageTemplateCategory,
  { label: string; order: number }
> = {
  primeiro_contato: { label: 'Primeiro Contato', order: 0 },
  follow_up:        { label: 'Follow-up',         order: 1 },
  proposta:         { label: 'Proposta',           order: 2 },
  fechamento:       { label: 'Fechamento',         order: 3 },
  geral:            { label: 'Geral',              order: 4 },
}

// ─── Return type ─────────────────────────────────────────────────────────────

export interface UseMessageTemplatesReturn {
  templates: MessageTemplate[]
  templatesByCategory: Record<MessageTemplateCategory, MessageTemplate[]>
  loading: boolean
  error: string | null
  substituteVariables: (body: string, lead: Lead) => string
  createTemplate: (
    data: Omit<MessageTemplate, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
  ) => Promise<void>
  updateTemplate: (id: string, data: Partial<MessageTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  refetch: () => void
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMessageTemplates(): UseMessageTemplatesReturn {
  const { tenant } = useTenant()
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchTemplates = useCallback(async () => {
    if (!tenant) return
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('message_templates')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (err) {
      setError(err.message)
    } else {
      setTemplates((data ?? []) as MessageTemplate[])
    }
    setLoading(false)
  }, [tenant])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // ── Group by category ────────────────────────────────────────────────────

  const templatesByCategory = templates.reduce(
    (acc, tpl) => {
      const cat = tpl.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(tpl)
      return acc
    },
    {} as Record<MessageTemplateCategory, MessageTemplate[]>
  )

  // ── Variable substitution ────────────────────────────────────────────────

  const substituteVariables = useCallback(
    (body: string, lead: Lead): string => {
      return body
        .replace(/\{nome\}/gi, lead.name)
        .replace(/\{serviço\}/gi, lead.service ?? '')
        .replace(/\{valor\}/gi, '')   // reserved — no source field yet
    },
    []
  )

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const createTemplate = useCallback(
    async (
      data: Omit<MessageTemplate, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
    ) => {
      if (!tenant) throw new Error('Tenant não encontrado')
      const { error: err } = await supabase.from('message_templates').insert({
        ...data,
        tenant_id: tenant.id,
      })
      if (err) throw err
      await fetchTemplates()
    },
    [tenant, fetchTemplates]
  )

  const updateTemplate = useCallback(
    async (id: string, data: Partial<MessageTemplate>) => {
      const { error: err } = await supabase
        .from('message_templates')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (err) throw err
      await fetchTemplates()
    },
    [fetchTemplates]
  )

  const deleteTemplate = useCallback(
    async (id: string) => {
      const { error: err } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id)
      if (err) throw err
      setTemplates(prev => prev.filter(t => t.id !== id))
    },
    []
  )

  return {
    templates,
    templatesByCategory,
    loading,
    error,
    substituteVariables,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  }
}
