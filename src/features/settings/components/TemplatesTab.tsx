import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, MessageSquare, Instagram, Mail } from 'lucide-react'
import { useMessageTemplates, CATEGORY_META } from '@/features/leads/hooks/useMessageTemplates'
import type { MessageTemplate } from '@/types/database'

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  whatsapp: <MessageSquare size={14} className="text-[#4ADE80]" />,
  instagram: <Instagram size={14} className="text-[#F472B6]" />,
  email: <Mail size={14} className="text-[#60A5FA]" />,
  geral: <MessageSquare size={14} className="text-[#A1B5CC]" />,
}

export function TemplatesTab() {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useMessageTemplates()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: '', body: '', category: 'geral', channel: 'whatsapp' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEdit = (tpl: MessageTemplate) => {
    setEditingId(tpl.id)
    setFormData({ title: tpl.title, body: tpl.body, category: tpl.category, channel: tpl.channel })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ title: '', body: '', category: 'geral', channel: 'whatsapp' })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateTemplate(editingId, formData)
        toast.success('Template atualizado!')
      } else {
        await createTemplate(formData as any)
        toast.success('Template criado!')
      }
      handleCancel()
    } catch (err: any) {
      toast.error('Erro ao salvar template', { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este template?')) {
      try {
        await deleteTemplate(id)
        toast.success('Template excluído')
      } catch (err: any) {
        toast.error('Erro ao excluir', { description: err.message })
      }
    }
  }

  if (loading) {
    return <div className="glass-card p-6 flex justify-center"><div className="ds-spinner" /></div>
  }

  return (
    <div className="space-y-6">
      
      {/* Formulário (Criar/Editar) */}
      <div className="glass-card p-6 border border-[#1E3E62]/50">
        <h3 className="text-sm font-semibold text-white mb-4">
          {editingId ? 'Editar Template' : 'Novo Template'}
        </h3>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#A1B5CC]">Título (Uso Interno)</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-[#0B192C] border border-[#1E3E62]/30 focus:border-[#FF6500]/50 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
                placeholder="Ex: Primeira Abordagem Insta"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A1B5CC]">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-[#0B192C] border border-[#1E3E62]/30 focus:border-[#FF6500]/50 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors appearance-none"
                >
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A1B5CC]">Canal</label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData(p => ({ ...p, channel: e.target.value }))}
                  className="w-full bg-[#0B192C] border border-[#1E3E62]/30 focus:border-[#FF6500]/50 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors appearance-none"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="email">E-mail</option>
                  <option value="geral">Geral</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#A1B5CC]">Mensagem</label>
            <textarea
              required
              rows={4}
              value={formData.body}
              onChange={(e) => setFormData(p => ({ ...p, body: e.target.value }))}
              className="w-full bg-[#0B192C] border border-[#1E3E62]/30 focus:border-[#FF6500]/50 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors resize-none"
              placeholder="Olá {nome}, vi que você tem interesse em {serviço}..."
            />
            <p className="text-[11px] text-[#A1B5CC]">Variáveis suportadas: <code className="text-[#FF6500] bg-[#FF6500]/10 px-1 py-0.5 rounded">{'{nome}'}</code> <code className="text-[#FF6500] bg-[#FF6500]/10 px-1 py-0.5 rounded">{'{serviço}'}</code> <code className="text-[#FF6500] bg-[#FF6500]/10 px-1 py-0.5 rounded">{'{valor}'}</code></p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E3E62]/50 hover:bg-[#1E3E62] text-white border border-[#1E3E62] rounded-lg text-sm font-medium transition-colors"
            >
              {isSubmitting ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <Plus size={16} />}
              {editingId ? 'Salvar' : 'Adicionar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-transparent text-[#A1B5CC] hover:text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listagem */}
      <div className="grid grid-cols-1 gap-4">
        {templates.map(tpl => (
          <div key={tpl.id} className="glass-card p-4 border border-[#1E3E62]/20 hover:border-[#1E3E62]/50 transition-colors group">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {CHANNEL_ICONS[tpl.channel]}
                  <span className="text-sm font-medium text-white">{tpl.title}</span>
                  {tpl.is_default && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/10 text-[#A1B5CC]">
                      Padrão
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#A1B5CC] uppercase tracking-wider mb-3">
                  {CATEGORY_META[tpl.category as keyof typeof CATEGORY_META]?.label || tpl.category}
                </div>
                <p className="text-sm text-white/80 whitespace-pre-wrap font-mono text-[13px] leading-relaxed">
                  {tpl.body}
                </p>
              </div>

              {!tpl.is_default && (
                <div className="flex items-center gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(tpl)} className="p-1.5 text-[#A1B5CC] hover:text-white hover:bg-[#1E3E62]/30 rounded">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(tpl.id)} className="p-1.5 text-[#A1B5CC] hover:text-[#F87171] hover:bg-[#F87171]/10 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
