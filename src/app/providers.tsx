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

      {/* ─── Toast notifications — glass-card §3 ──────────────────────── */}
      {/*
        Sonner não aplica backdropFilter via toastOptions.style (limitação interna).
        Injetamos o estilo glass-card diretamente via CSS global nos seletores
        de data-attribute que o Sonner usa, garantindo o blur real.
      */}
      <style>{`
        [data-sonner-toast] {
          background: rgba(11, 25, 44, 0.88) !important;
          backdrop-filter: blur(20px) saturate(160%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
          border: 1px solid rgba(255, 255, 255, 0.09) !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06) !important;
          border-radius: 12px !important;
          font-family: Inter, system-ui, sans-serif !important;
          font-size: 13px !important;
          color: #ffffff !important;
          padding: 12px 16px !important;
        }
        [data-sonner-toast] [data-title] {
          font-weight: 600 !important;
          color: #ffffff !important;
          font-size: 13px !important;
        }
        [data-sonner-toast] [data-description] {
          color: #A1B5CC !important;
          font-size: 11px !important;
          margin-top: 2px !important;
          font-family: 'JetBrains Mono', monospace !important;
        }
        [data-sonner-toast][data-type='success'] [data-icon] svg {
          color: #FF6500 !important;
          stroke: #FF6500 !important;
        }
        [data-sonner-toast][data-type='error'] [data-icon] svg {
          color: rgba(255, 80, 60, 0.9) !important;
          stroke: rgba(255, 80, 60, 0.9) !important;
        }
        [data-sonner-toast] button[data-close-button] {
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          color: #A1B5CC !important;
        }
        [data-sonner-toast] button[data-close-button]:hover {
          background: rgba(255,255,255,0.12) !important;
          color: #ffffff !important;
        }
      `}</style>

      <Toaster
        position="bottom-right"
        theme="dark"
        richColors={false}
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
