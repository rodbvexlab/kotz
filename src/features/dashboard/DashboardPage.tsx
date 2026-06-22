import { useAuth } from '@/app/providers'
import { useTenant } from '@/lib/tenant'

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const { tenant } = useTenant()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#1E3E62]/30 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">
            <span className="text-white">Ko</span>
            <span className="text-[#FF6500]">tz</span>
          </span>
          {tenant && (
            <span className="text-[#1E3E62] text-sm border-l border-[#1E3E62]/30 pl-3">
              {tenant.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#1E3E62] text-sm">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-sm text-[#1E3E62] hover:text-white transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-1">
          Olá{tenant ? `, ${tenant.name}` : ''} 👋
        </h1>
        <p className="text-[#1E3E62] mb-8">Dashboard em construção — Fase 2</p>

        <div className="grid grid-cols-3 gap-4">
          {['Leads ativos', 'Propostas enviadas', 'Fechados no mês'].map((label) => (
            <div key={label} className="bg-[#0B192C] border border-[#1E3E62]/30 rounded-xl p-6">
              <p className="text-[#1E3E62] text-sm mb-2">{label}</p>
              <p className="text-3xl font-bold text-white">—</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
