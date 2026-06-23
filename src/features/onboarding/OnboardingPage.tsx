import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/providers'
import { useTenant } from '@/lib/tenant'
import { toast } from 'sonner'
import { Building2, ArrowRight, Loader2 } from 'lucide-react'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function OnboardingPage() {
  const { user } = useAuth()
  const { tenant, refetch } = useTenant()
  const navigate = useNavigate()

  const [companyName, setCompanyName] = useState('')
  const [saving, setSaving] = useState(false)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'você'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = companyName.trim()
    if (!name || !tenant) return

    setSaving(true)
    const { error } = await supabase
      .from('tenants')
      .update({ name, slug: slugify(name) })
      .eq('id', tenant.id)

    if (error) {
      toast.error('Erro ao salvar', { description: error.message })
      setSaving(false)
      return
    }

    await refetch()
    toast.success('Workspace configurado!', { description: `${name} está pronto para uso.` })
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#FF6500] selection:text-white">
      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#1E3E62]/20 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#FF6500]/[0.06] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-white">Ko</span>
            <span className="text-[#FF6500]">tz</span>
          </h1>
        </div>

        {/* Glass Card */}
        <div
          className="rounded-2xl p-8 sm:p-10"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Welcome text */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#FF6500]/10 border border-[#FF6500]/20 mb-5">
              <Building2 className="w-7 h-7 text-[#FF6500]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Olá, {firstName}!
            </h2>
            <p className="text-[#A1B5CC] text-sm leading-relaxed">
              Dê um nome ao seu workspace para começar<br />
              a gerenciar seus leads.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="company-name"
                className="block text-xs font-medium text-[#A1B5CC] mb-2 uppercase tracking-wider"
              >
                Nome da empresa
              </label>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Minha Empresa"
                autoFocus
                required
                maxLength={60}
                className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-[#1E3E62] outline-none transition-all duration-200 focus:border-[#FF6500]/50 focus:ring-1 focus:ring-[#FF6500]/25"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!companyName.trim() || saving}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: companyName.trim() && !saving
                  ? 'linear-gradient(135deg, #FF6500, #e05a00)'
                  : 'rgba(255, 101, 0, 0.15)',
                color: companyName.trim() && !saving ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow: companyName.trim() && !saving
                  ? '0 0 20px rgba(255, 101, 0, 0.25), 0 4px 12px rgba(0,0,0,0.3)'
                  : 'none',
              }}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Começar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Subtle footer */}
        <p className="text-center text-[10px] text-[#1E3E62] mt-6 font-mono">
          Você pode alterar isso depois nas configurações
        </p>
      </div>
    </div>
  )
}
