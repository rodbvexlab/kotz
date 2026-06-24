import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/lib/tenant'
import { Save, Building, Image as ImageIcon } from 'lucide-react'

export function WorkspaceTab() {
  const { tenant } = useTenant()
  
  const [name, setName] = useState('')
  const [validDays, setValidDays] = useState('7')
  const [primaryColor, setPrimaryColor] = useState('#FF6500')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (tenant) {
      setName(tenant.name || '')
      
      const fetchSettings = async () => {
        const { data } = await supabase
          .from('workspace_settings')
          .select('*')
          .eq('tenant_id', tenant.id)
          .single()
          
        if (data) {
          setValidDays(data.proposal_valid_days?.toString() || '7')
          setPrimaryColor(data.primary_color || '#FF6500')
          setLogoUrl(data.logo_url || '')
        }
      }
      fetchSettings()
    }
  }, [tenant])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenant) return
    setLoading(true)

    // Update Tenant Name
    const { error: tenantError } = await supabase
      .from('tenants')
      .update({ name })
      .eq('id', tenant.id)

    // Update Settings
    const { error: settingsError } = await supabase
      .from('workspace_settings')
      .update({
        proposal_valid_days: parseInt(validDays),
        primary_color: primaryColor,
        logo_url: logoUrl
      })
      .eq('tenant_id', tenant.id)

    if (tenantError || settingsError) {
      toast.error('Erro ao salvar configurações', { description: tenantError?.message || settingsError?.message })
    } else {
      toast.success('Workspace atualizado com sucesso!')
    }
    
    setLoading(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !tenant) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${tenant.id}-${Math.random()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('workspace-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('workspace-assets')
        .getPublicUrl(filePath)

      setLogoUrl(data.publicUrl)
      toast.success('Logo carregado', { description: 'Não esqueça de salvar as alterações.' })
    } catch (err: any) {
      toast.error('Erro no upload', { description: 'Bucket "workspace-assets" pode não existir. Usando fallback de URL externa.' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-[#1E3E62]/30 flex items-center justify-center border border-[#1E3E62]/50">
          <Building size={24} className="text-[#A1B5CC]" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Configurações do Workspace</h2>
          <p className="text-sm text-[#A1B5CC]">Ajustes globais do seu ambiente Kotz</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-md">
        
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/90 border-b border-[#1E3E62]/30 pb-2">Informações Básicas</h3>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#A1B5CC]">Nome do Workspace</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#0B192C] border border-[#1E3E62]/30 focus:border-[#FF6500]/50 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#A1B5CC]">Logo do Workspace</label>
            
            <div className="flex items-center gap-4 mt-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded bg-white object-contain p-1 border border-[#1E3E62]/50" />
              ) : (
                <div className="w-12 h-12 rounded bg-[#0B192C] flex items-center justify-center border border-[#1E3E62]/50 border-dashed">
                  <ImageIcon size={16} className="text-[#A1B5CC]/50" />
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="URL do Logo (ex: https://...)"
                  className="w-full bg-[#0B192C] border border-[#1E3E62]/30 focus:border-[#FF6500]/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 outline-none transition-colors"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#A1B5CC]">Ou</span>
                  <label className="text-xs text-[#FF6500] hover:text-[#FF6500]/80 cursor-pointer font-medium transition-colors">
                    Fazer Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploading} />
                  </label>
                  {isUploading && <span className="text-xs text-[#A1B5CC]">Enviando...</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/90 border-b border-[#1E3E62]/30 pb-2">Propostas</h3>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#A1B5CC]">Validade Padrão (Dias)</label>
            <input
              type="number"
              min="1"
              value={validDays}
              onChange={(e) => setValidDays(e.target.value)}
              className="w-full bg-[#0B192C] border border-[#1E3E62]/30 focus:border-[#FF6500]/50 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#A1B5CC]">Cor Primária (Identidade da Proposta)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 bg-[#0B192C] border border-[#1E3E62]/30 focus:border-[#FF6500]/50 rounded-lg px-4 py-2.5 text-sm text-white outline-none uppercase transition-colors"
              />
            </div>
            <p className="text-[11px] text-[#A1B5CC]/70">Essa cor será usada no link público enviado ao seu cliente.</p>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6500] hover:bg-[#FF6500]/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <Save size={16} />}
            Salvar Workspace
          </button>
        </div>
      </form>
    </div>
  )
}
