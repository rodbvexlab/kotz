import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import { toast } from 'sonner'
import type { Task } from '@/types/database'

export function useTasks(leadId: string | null) {
  const { tenant } = useTenant()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    if (!leadId || !tenant) return
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('lead_id', leadId)
      .eq('tenant_id', tenant.id)
      .order('due_date', { ascending: true })

    if (error) {
      toast.error('Erro ao carregar tarefas', { description: error.message })
    } else {
      setTasks((data as Task[]) ?? [])
    }
    setLoading(false)
  }, [leadId, tenant])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const addTask = useCallback(async (title: string, dueDate: string) => {
    if (!leadId || !tenant) return
    const { data: { user } } = await supabase.auth.getUser()

    const optimistic: Task = {
      id: `temp_${Date.now()}`,
      lead_id: leadId,
      tenant_id: tenant.id,
      title,
      due_date: dueDate,
      status: 'pending',
      created_by: user?.id ?? null,
      created_at: new Date().toISOString(),
    }
    setTasks(prev => [...prev, optimistic].sort((a, b) => a.due_date.localeCompare(b.due_date)))

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        lead_id: leadId,
        tenant_id: tenant.id,
        title,
        due_date: dueDate,
        created_by: user?.id ?? null,
      })
      .select()
      .single()

    if (error) {
      setTasks(prev => prev.filter(t => t.id !== optimistic.id))
      toast.error('Erro ao criar tarefa', { description: error.message })
      return
    }
    if (data) {
      setTasks(prev => prev.map(t => t.id === optimistic.id ? (data as Task) : t))
      toast.success('Tarefa criada')
    }
  }, [leadId, tenant])

  const toggleTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const newStatus = task.status === 'pending' ? 'completed' : 'pending'

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } as Task : t))

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: task.status } as Task : t))
      toast.error('Erro ao atualizar tarefa')
    }
  }, [tasks])

  return { tasks, loading, addTask, toggleTask, refetch: fetchTasks }
}
