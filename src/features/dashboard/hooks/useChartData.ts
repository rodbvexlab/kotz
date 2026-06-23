import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'

export interface ChartPoint {
  semana: string
  leads_criados: number
  propostas: number
  fechados: number
}

function getISOWeekLabel(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  return `S${weekNum}`
}

function buildChartPoints(
  leads: Array<{ status: string; created_at: string }>,
): ChartPoint[] {
  const weekMap = new Map<string, { created: number; propostas: number; fechados: number; sortKey: string }>()

  for (const lead of leads) {
    const date = new Date(lead.created_at)
    const label = getISOWeekLabel(date)
    const sortKey = lead.created_at.slice(0, 10)

    if (!weekMap.has(label)) {
      weekMap.set(label, { created: 0, propostas: 0, fechados: 0, sortKey })
    }
    const bucket = weekMap.get(label)!
    if (sortKey < bucket.sortKey) bucket.sortKey = sortKey

    bucket.created++
    if (lead.status === 'proposta_enviada') bucket.propostas++
    if (lead.status === 'fechado') bucket.fechados++
  }

  return Array.from(weekMap.entries())
    .sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey))
    .slice(-8)
    .map(([semana, v]) => ({
      semana,
      leads_criados: v.created,
      propostas: v.propostas,
      fechados: v.fechados,
    }))
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
        .from('leads')
        .select('status, created_at')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('[useChartData]', error)
        setLoading(false)
        return
      }

      setData(buildChartPoints(rows ?? []))
      setLoading(false)
    }

    fetchChart()
  }, [tenant])

  return { data, loading: tenantLoading || loading }
}
