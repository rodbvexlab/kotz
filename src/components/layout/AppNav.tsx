import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, BarChart2, LogOut } from 'lucide-react'
import { useAuth } from '@/app/providers'
import { useTenant } from '@/lib/tenant'

export function AppNav() {
  const { signOut } = useAuth()
  const { tenant } = useTenant()
  const location = useLocation()

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    { to: '/pipeline',  label: 'Pipeline',  icon: LayoutGrid },
  ]

  const capitalize = (s: string) =>
    s.replace(/\b\w/g, c => c.toUpperCase())

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-black/80 backdrop-blur-md border-b border-[#1E3E62]/20">

      {/* Esquerda: Logo + links */}
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-lg font-bold tracking-tight shrink-0">
          <span className="text-white">Ko</span>
          <span className="text-[#FF6500]">tz</span>
        </Link>

        {/* Divider */}
        <div className="h-4 w-px bg-[#1E3E62]/30" />

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={[
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                  'text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-[#FF6500]/10 text-[#FF6500] border border-[#FF6500]/20'
                    : 'text-[#1E3E62] hover:text-white hover:bg-[#1E3E62]/15 border border-transparent',
                ].join(' ')}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Direita: Tenant + logout */}
      <div className="flex items-center gap-3">
        {tenant && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B192C] border border-[#1E3E62]/20">
            <div className="w-5 h-5 rounded-full bg-[#FF6500]/20 border border-[#FF6500]/30 flex items-center justify-center">
              <span className="text-[9px] font-bold text-[#FF6500]">
                {capitalize(tenant.name).charAt(0)}
              </span>
            </div>
            <span className="text-xs text-white/70 font-medium">
              {capitalize(tenant.name)}
            </span>
          </div>
        )}

        <button
          onClick={signOut}
          title="Sair"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1E3E62] hover:text-white hover:bg-[#1E3E62]/20 transition-all border border-transparent hover:border-[#1E3E62]/30"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  )
}
