import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'

export interface DashboardMetrics {
  total_leads: number
  total_propostas: number
  fechados_mes: number
  taxa_conversao: number
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
      const { data, error } = await (supabase
        .from('tenant_metrics' as any) as any)
        .select('*')
        .eq('tenant_id', tenant!.id)
        .single()
      if (error) {
        setError('Erro ao carregar métricas.')
      } else if (data) {
        setMetrics({
          total_leads: Number(data.total_leads ?? 0),
          total_propostas: Number(data.total_propostas ?? 0),
          fechados_mes: Number(data.fechados_mes ?? 0),
          taxa_conversao: Number(data.taxa_conversao ?? 0),
        })
      }
      setLoading(false)
    }
    fetchMetrics()
  }, [tenant])

  return { metrics, loading: tenantLoading || loading, error }
}
