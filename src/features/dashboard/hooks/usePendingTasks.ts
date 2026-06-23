import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'

export interface PendingTask {
  id: string
  title: string
  due_date: string
  lead_name: string
  lead_id: string
  is_overdue: boolean
}

export function usePendingTasks() {
  const { tenant, loading: tenantLoading } = useTenant()
  const [tasks, setTasks] = useState<PendingTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenant) return

    async function fetch() {
      setLoading(true)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 2)
      tomorrow.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, due_date, lead_id, leads!inner(name)')
        .eq('tenant_id', tenant!.id)
        .eq('status', 'pending')
        .lte('due_date', tomorrow.toISOString())
        .order('due_date', { ascending: true })
        .limit(10)

      if (error) {
        setLoading(false)
        return
      }

      const now = new Date()
      const mapped: PendingTask[] = (data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title,
        due_date: row.due_date,
        lead_name: row.leads?.name ?? '',
        lead_id: row.lead_id,
        is_overdue: new Date(row.due_date) < now,
      }))

      setTasks(mapped)
      setLoading(false)
    }

    fetch()
  }, [tenant])

  return { tasks, loading: tenantLoading || loading }
}
