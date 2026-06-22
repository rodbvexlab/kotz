import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleEmailLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('E-mail ou senha incorretos.')
    setLoading(false)
  }

  async function handleEmailSignUp() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setError('Verifique seu e-mail para confirmar o cadastro.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B192C] via-black to-black pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-4xl font-bold tracking-tight">
            <span className="text-white">Ko</span>
            <span className="text-[#FF6500]">tz</span>
          </span>
          <p className="text-[#1E3E62] text-sm mt-2 tracking-wide uppercase">CRM</p>
        </div>

        {/* Card */}
        <div className="bg-[#0B192C] border border-[#1E3E62]/40 rounded-xl p-8 space-y-5">
          <h1 className="text-white text-lg font-semibold">Entrar na sua conta</h1>

          {/* Google OAuth — método principal */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg py-2.5 transition-colors disabled:opacity-50"
          >
            <GoogleIcon />
            Continuar com Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#1E3E62]/40" />
            <span className="text-[#1E3E62] text-xs">ou use e-mail</span>
            <div className="flex-1 h-px bg-[#1E3E62]/40" />
          </div>

          {/* Email + Senha */}
          <div className="space-y-3">
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#112236] border border-[#1E3E62]/50 rounded-lg px-4 py-2.5 text-white placeholder-[#1E3E62] text-sm focus:outline-none focus:border-[#FF6500] transition-colors"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
              className="w-full bg-[#112236] border border-[#1E3E62]/50 rounded-lg px-4 py-2.5 text-white placeholder-[#1E3E62] text-sm focus:outline-none focus:border-[#FF6500] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-[#FF6500]/80 bg-[#FF6500]/10 border border-[#FF6500]/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleEmailLogin}
              disabled={loading || !email || !password}
              className="flex-1 bg-[#FF6500] hover:bg-[#e55a00] text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-40"
            >
              Entrar
            </button>
            <button
              onClick={handleEmailSignUp}
              disabled={loading || !email || !password}
              className="flex-1 bg-[#112236] hover:bg-[#162d47] border border-[#1E3E62]/50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-40"
            >
              Criar conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
