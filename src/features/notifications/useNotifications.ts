import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import type { Notification } from '@/types/database'

export function useNotifications() {
  const { tenant } = useTenant()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!tenant) return
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false })
      .limit(30)
    setNotifications((data as Notification[]) ?? [])
    setLoading(false)
  }, [tenant])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAllRead = useCallback(async () => {
    if (!tenant || unreadCount === 0) return
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('tenant_id', tenant.id)
      .eq('is_read', false)
  }, [tenant, unreadCount])

  return { notifications, loading, unreadCount, markAllRead, refetch: fetchNotifications }
}
