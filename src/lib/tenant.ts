import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Tenant } from '@/types/database'

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTenant() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('tenant_users')
        .select('tenant_id, tenants(*)')
        .eq('user_id', user.id)
        .single()

      if (data?.tenants) {
        setTenant(data.tenants as unknown as Tenant)
      }
      setLoading(false)
    }

    fetchTenant()
  }, [])

  return { tenant, loading }
}
