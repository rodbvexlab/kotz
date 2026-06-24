import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/app/providers'
import { supabase } from '@/lib/supabase'
import { Save, UserCircle, Mail } from 'lucide-react'

export function ProfileTab() {
  const { user } = useAuth()
  
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.user_metadata) {
      setName(user.user_metadata.full_name || '')
      setAvatarUrl(user.user_metadata.avatar_url || '')
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      data: { 
        full_name: name,
        avatar_url: avatarUrl 
      }
    })

    if (error) {
      toast.error('Erro ao atualizar perfil', { description: error.message })
    } else {
      toast.success('Perfil atualizado com sucesso!')
    }
    
    setLoading(false)
  }

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-16 h-16 rounded-full object-cover border border-[#1E3E62]/30" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#1E3E62]/30 flex items-center justify-center border border-[#1E3E62]/50">
            <UserCircle size={32} className="text-[#A1B5CC]" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-medium text-white">{name || 'Seu Nome'}</h2>
          <p className="text-sm text-[#A1B5CC]">Personalize suas informações de usuário</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#A1B5CC]">E-mail</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={16} className="text-[#A1B5CC]/50" />
            </div>
            <input
              type="text"
              value={user?.email || ''}
              readOnly
              className="w-full bg-[#080c14]/50 border border-[#1E3E62]/30 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#A1B5CC] outline-none cursor-not-allowed opacity-70"
            />
          </div>
          <p className="text-[11px] text-[#A1B5CC]/70">O e-mail de login não pode ser alterado por aqui.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#A1B5CC]">Nome Completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome"
            className="w-full bg-[#0B192C] border border-[#1E3E62]/30 focus:border-[#FF6500]/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#A1B5CC]">URL da Foto de Perfil</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-[#0B192C] border border-[#1E3E62]/30 focus:border-[#FF6500]/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6500] hover:bg-[#FF6500]/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <Save size={16} />}
            Salvar Perfil
          </button>
        </div>
      </form>
    </div>
  )
}
