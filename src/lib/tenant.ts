import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Tenant } from '@/types/database'

export function tenantNeedsSetup(tenant: Tenant | null, userEmail?: string): boolean {
  if (!tenant) return false
  const name = tenant.name.trim()
  if (!name) return true
  if (name.includes('@')) return true
  if (userEmail && name.toLowerCase() === userEmail.toLowerCase()) return true
  return false
}

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTenant = useCallback(async () => {
    setLoading(true)
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
  }, [])

  useEffect(() => {
    fetchTenant()
  }, [fetchTenant])

  return { tenant, loading, refetch: fetchTenant }
}
