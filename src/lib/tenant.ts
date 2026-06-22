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

      const { data: tu } = await supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single()

      if (!tu?.tenant_id) { setLoading(false); return }

      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tu.tenant_id)
        .single()

      if (tenant) setTenant(tenant)
      setLoading(false)
    }

    fetchTenant()
  }, [])

  return { tenant, loading }
}
