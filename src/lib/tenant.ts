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

      const { data: tenantUser } = await supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single()

      if (!tenantUser?.tenant_id) { setLoading(false); return }

      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantUser.tenant_id)
        .single()

      if (tenantData) setTenant(tenantData)
      setLoading(false)
    }

    fetchTenant()
  }, [])

  return { tenant, loading }
}
