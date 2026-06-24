import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './providers'
import { useTenant, tenantNeedsSetup } from '@/lib/tenant'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { PipelinePage } from '@/features/leads/PipelinePage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { ProposalPublicPage } from '@/features/proposals/ProposalPublicPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, user, loading: authLoading } = useAuth()
  const { tenant, loading: tenantLoading } = useTenant()
  const location = useLocation()

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="ds-spinner" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  if (tenantNeedsSetup(tenant, user?.email ?? undefined) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

export function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="ds-spinner" />
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
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
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
        <Route path="/p/:slug" element={<ProposalPublicPage />} />
        <Route path="*" element={<Navigate to={session ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
