import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'

export interface TodayMetrics {
  leads_need_attention: number
  proposals_no_view: number
  closed_this_week: number
}

function getMonday(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function useToday() {
  const { tenant } = useTenant()
  const [data, setData] = useState<TodayMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenant) return

    async function fetch() {
      setLoading(true)
      const now = new Date()

      const { data: leads } = await supabase
        .from('leads')
        .select('id, status, updated_at')
        .eq('tenant_id', tenant!.id)

      let needAttention = 0
      if (leads) {
        for (const lead of leads) {
          const daysSinceUpdate = (now.getTime() - new Date(lead.updated_at).getTime()) / 86400000
          if (lead.status === 'novo' && daysSinceUpdate > 2) needAttention++
          else if (lead.status === 'em_contato' && daysSinceUpdate > 5) needAttention++
          else if (lead.status === 'proposta_enviada' && daysSinceUpdate > 3) needAttention++
        }
      }

      const threeDaysAgo = new Date(now.getTime() - 3 * 86400000).toISOString()
      const { count: proposalsNoView } = await supabase
        .from('proposals')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenant!.id)
        .eq('status', 'sent')
        .eq('viewed_count', 0)
        .lt('created_at', threeDaysAgo)

      const mondayIso = getMonday().toISOString()
      const closedThisWeek = leads
        ? leads.filter(l => l.status === 'fechado' && l.updated_at >= mondayIso).length
        : 0

      setData({
        leads_need_attention: needAttention,
        proposals_no_view: proposalsNoView ?? 0,
        closed_this_week: closedThisWeek,
      })
      setLoading(false)
    }

    fetch()
  }, [tenant])

  return { data, loading }
}
