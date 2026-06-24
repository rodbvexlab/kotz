import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'
import AttractButton from '@/components/ui/AttractButton'
import Orb from '@/components/ui/Orb'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    if (!email || !password) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('E-mail ou senha incorretos.')
    setLoading(false)
  }

  async function handleEmailSignUp() {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setError('Verifique seu e-mail para confirmar o cadastro.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen text-white flex font-sans selection:bg-[#FF6500] selection:text-white overflow-hidden relative">

      <style>{`
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #FF6500 }
        }
        @keyframes phrase-cycle {
          0%, 33.33% { content: "Gerencie seus leads." }
          33.34%, 66.66% { content: "Feche mais negócios." }
          66.67%, 100% { content: "Cresça com clareza." }
        }
        .typewriter-text {
          display: inline-block;
          overflow: hidden;
          border-right: 3px solid #FF6500;
          white-space: nowrap;
          letter-spacing: 0.03em;
          animation:
            typing 3s steps(22, end) infinite alternate,
            blink-caret 0.75s step-end infinite;
        }
        .typewriter-text::after {
          content: "";
          animation: phrase-cycle 18s infinite;
        }
        .login-input {
          background: rgba(0,0,0,0.35) !important;
          border: 1px solid rgba(255,255,255,0.10) !important;
          color: white !important;
          border-radius: 8px !important;
          transition: all 0.2s ease;
        }
        .login-input:focus {
          border-color: rgba(255,101,0,0.50) !important;
          box-shadow: 0 0 0 1px rgba(255,101,0,0.50) !important;
          background: rgba(0,0,0,0.45) !important;
        }
        .login-input::placeholder {
          color: rgba(161,181,204,0.50) !important;
        }
        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:hover, 
        .login-input:-webkit-autofill:focus {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(0,0,0,0.35) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* ─── LEFT: Login Form ──────────────────────────────────────────── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 z-10 relative bg-transparent">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <span className="text-4xl font-extrabold tracking-tight">
              <span className="text-white">Ko</span>
              <span
                className="text-[#FF6500] drop-shadow-[0_0_8px_rgba(255,101,0,0.35)]"
              >
                tz
              </span>
            </span>
            <p className="text-white/60 text-xs mt-1.5 tracking-[0.3em] uppercase font-mono">CRM</p>
          </div>

          {/* Glass Card */}
          <div
            className="p-8 space-y-6 rounded-2xl bg-white/[0.04] backdrop-blur-[24px] saturate-[170%] border border-white/[0.08]"
            style={{
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Entrar na sua conta</h1>
              <p className="text-xs text-white/50 mt-1">
                Insira seus dados de acesso abaixo.
              </p>
            </div>

            {/* Google OAuth — glass style */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 font-semibold rounded-xl py-2.5 text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer bg-white text-slate-900 border border-transparent hover:bg-slate-100"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1E3E62]/30" />
              <span className="text-xs font-medium text-white/40">
                ou use e-mail
              </span>
              <div className="flex-1 h-px bg-[#1E3E62]/30" />
            </div>

            {/* Email + Password inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full login-input px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#A1B5CC] uppercase tracking-wider mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                    className="w-full login-input pl-4 pr-10 py-2.5 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1B5CC] hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs rounded-lg px-3 py-2.5 font-mono text-[#FF6500]/90 bg-[#FF6500]/[0.08] border border-[#FF6500]/15">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <AttractButton
                onClick={handleEmailLogin}
                disabled={loading || !email || !password}
                className="w-full flex-1"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </AttractButton>
              <button
                onClick={handleEmailSignUp}
                disabled={loading || !email || !password}
                className="flex-1 font-semibold rounded-lg py-2.5 text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-[#FF6500]/25"
              >
                Criar conta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Orb WebGL ──────────────────────────────────────────── */}
      <div
        className="hidden md:flex flex-1 relative overflow-hidden"
        style={{ borderLeft: '1px solid rgba(30,62,98,0.15)' }}
      >
        {/* Orb */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: '500px', height: '500px' }}>
            <Orb
              hue={18}
              hoverIntensity={0.4}
              rotateOnHover={true}
              backgroundColor="transparent"
            />
          </div>
        </div>

        {/* Typewriter text */}
        <div className="absolute bottom-12 left-0 right-0 text-center z-10">
          <div className="min-h-[40px] flex items-center justify-center">
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
              <span className="typewriter-text font-bold" />
            </h2>
          </div>
          <p
            className="mt-3"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#A1B5CC',
              fontSize: '13px',
              opacity: 0.5,
            }}
          >
            — Kotz CRM
          </p>
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
