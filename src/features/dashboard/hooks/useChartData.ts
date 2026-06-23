import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'

export interface ChartPoint {
  semana: string
  leads_criados: number
  propostas: number
  fechados: number
}

export function useChartData() {
  const { tenant, loading: tenantLoading } = useTenant()
  const [data, setData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenant) return

    async function fetchChart() {
      setLoading(true)
      const { data: rows, error } = await supabase
        .rpc('get_pipeline_chart_data', { p_tenant_id: tenant!.id })

      if (error) {
        console.error('[useChartData]', error)
      } else {
        setData((rows as ChartPoint[]) ?? [])
      }
      setLoading(false)
    }

    fetchChart()
  }, [tenant])

  return { data, loading: tenantLoading || loading }
}
