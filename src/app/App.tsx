import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './providers'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { PipelinePage } from '@/features/leads/PipelinePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#FF6500] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#FF6500] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage
                metrics={{
                  total_leads: 24,
                  total_propostas: 15,
                  fechados_mes: 8,
                  taxa_conversao: 28
                }}
                loading={false}
                tenantName="Être Creative"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pipeline"
          element={<ProtectedRoute><PipelinePage /></ProtectedRoute>}
        />
        <Route
          path="/leads"
          element={<ProtectedRoute><PipelinePage /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to={session ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
