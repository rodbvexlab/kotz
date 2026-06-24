import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import type { Lead } from '@/types/pipeline'

export function useGlobalSearch(debouncedTerm: string) {
  const { tenant } = useTenant()
  const [results, setResults] = useState<Lead[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    async function search() {
      if (!debouncedTerm.trim() || !tenant) {
        setResults([])
        return
      }

      setIsSearching(true)
      const term = `%${debouncedTerm}%`

      // Unified search across leads properties as requested
      const { data, error } = await supabase
        .from('leads')
        .select('*, company:companies(*)')
        .eq('tenant_id', tenant.id)
        .or(`name.ilike.${term},service.ilike.${term},email.ilike.${term},phone.ilike.${term}`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setResults(data as Lead[])
      } else {
        setResults([])
      }
      setIsSearching(false)
    }

    search()
  }, [debouncedTerm, tenant])

  return { results, isSearching }
}
