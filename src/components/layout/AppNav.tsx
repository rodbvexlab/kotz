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
    { to: '/pipeline', label: 'Pipeline', icon: LayoutGrid },
  ]

  function capitalize(str: string) {
    return str.replace(/\b\w/g, c => c.toUpperCase())
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[#1E3E62]/20 bg-black/80 backdrop-blur-sm sticky top-0 z-30">

      {/* Logo + Nav links */}
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-lg font-bold tracking-tight">
          <span className="text-white">Ko</span>
          <span className="text-[#FF6500]">tz</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all',
                  active
                    ? 'bg-[#FF6500]/10 text-[#FF6500] font-medium'
                    : 'text-[#1E3E62] hover:text-white hover:bg-[#1E3E62]/20',
                ].join(' ')}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Tenant + signout */}
      <div className="flex items-center gap-3">
        {tenant && (
          <span className="text-sm text-[#1E3E62]">
            {capitalize(tenant.name)}
          </span>
        )}
        <button
          onClick={signOut}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1E3E62] hover:text-white hover:bg-[#1E3E62]/20 transition-all"
          title="Sair"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  )
}
