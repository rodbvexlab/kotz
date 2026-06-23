import { supabase } from './supabase'
import { toast } from 'sonner'
import type { LeadStatus } from '@/types/pipeline'

interface AutomationContext {
  leadId: string
  leadName: string
  tenantId: string
  oldStatus: LeadStatus
  newStatus: LeadStatus
}

interface AutomationRule {
  trigger: (ctx: AutomationContext) => boolean
  execute: (ctx: AutomationContext) => Promise<void>
}

function addBusinessDays(from: Date, days: number): Date {
  const result = new Date(from)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const dow = result.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  result.setHours(10, 0, 0, 0)
  return result
}

const RULES: AutomationRule[] = [
  {
    trigger: (ctx) => ctx.newStatus === 'proposta_enviada' && ctx.oldStatus !== 'proposta_enviada',
    execute: async (ctx) => {
      const { data: { user } } = await supabase.auth.getUser()
      const dueDate = addBusinessDays(new Date(), 3)

      const { error } = await supabase.from('tasks').insert({
        lead_id: ctx.leadId,
        tenant_id: ctx.tenantId,
        title: `Follow-up da proposta enviada para ${ctx.leadName}`,
        due_date: dueDate.toISOString(),
        created_by: user?.id ?? null,
      })

      if (error) {
        console.error('[automation] proposta follow-up error:', error)
        return
      }

      toast.success('Automação ativada', {
        description: 'Criei automaticamente um follow-up para daqui a 3 dias úteis.',
      })
    },
  },
  {
    trigger: (ctx) => ctx.newStatus === 'perdido' && ctx.oldStatus !== 'perdido',
    execute: async (ctx) => {
      const { data: { user } } = await supabase.auth.getUser()
      const dueDate = addBusinessDays(new Date(), 5)

      const { error } = await supabase.from('tasks').insert({
        lead_id: ctx.leadId,
        tenant_id: ctx.tenantId,
        title: `Análise de churn: ${ctx.leadName}`,
        due_date: dueDate.toISOString(),
        created_by: user?.id ?? null,
      })

      if (error) {
        console.error('[automation] churn analysis error:', error)
        return
      }

      toast.success('Automação ativada', {
        description: 'Criei uma tarefa de análise de churn para daqui a 5 dias úteis.',
      })
    },
  },
]

export async function runAutomations(ctx: AutomationContext): Promise<void> {
  if (ctx.oldStatus === ctx.newStatus) return

  for (const rule of RULES) {
    if (rule.trigger(ctx)) {
      try {
        await rule.execute(ctx)
      } catch (err) {
        console.error('[automation] rule execution failed:', err)
      }
    }
  }
}
