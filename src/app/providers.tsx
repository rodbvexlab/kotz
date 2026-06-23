import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { Toaster } from 'sonner'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}

      {/* ─── Toast notifications — glass-card style §3 ──────────────────── */}
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors={false}
        closeButton
        toastOptions={{
          style: {
            background:     'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            border:         '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow:      '0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)',
            borderRadius:   '12px',
            color:          '#ffffff',
            fontFamily:     'Inter, system-ui, sans-serif',
            fontSize:       '13px',
            fontWeight:     '500',
          },
          classNames: {
            title:       'text-white font-semibold text-[13px]',
            description: 'text-[#A1B5CC] text-xs mt-0.5',
            icon:        'text-[#FF6500]',
          },
        }}
      />
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
