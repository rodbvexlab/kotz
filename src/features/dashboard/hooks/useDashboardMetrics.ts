import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import type { Lead } from '@/types/database'

export interface DashboardMetrics {
  total_leads: number
  total_propostas: number
  fechados_mes: number
  taxa_conversao: number
}

function computeMetrics(leads: Lead[]): DashboardMetrics {
  const active = leads.filter(l => l.status !== 'perdido' && l.status !== 'fechado')
  const propostas = leads.filter(l => l.status === 'proposta_enviada')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const fechadosMes = leads.filter(
    l => l.status === 'fechado' && l.updated_at >= monthStart,
  )

  const totalFinalizados = leads.filter(
    l => l.status === 'fechado' || l.status === 'perdido',
  ).length
  const taxa = totalFinalizados > 0
    ? Math.round((leads.filter(l => l.status === 'fechado').length / totalFinalizados) * 100)
    : 0

  return {
    total_leads: active.length,
    total_propostas: propostas.length,
    fechados_mes: fechadosMes.length,
    taxa_conversao: taxa,
  }
}

export function useDashboardMetrics() {
  const { tenant, loading: tenantLoading } = useTenant()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenant) return

    async function fetchMetrics() {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('leads')
        .select('id, status, updated_at')
        .eq('tenant_id', tenant!.id)

      if (err) {
        setError('Erro ao carregar métricas.')
        setLoading(false)
        return
      }

      setMetrics(computeMetrics((data ?? []) as Lead[]))
      setLoading(false)
    }

    fetchMetrics()
  }, [tenant])

  return { metrics, loading: tenantLoading || loading, error }
}
