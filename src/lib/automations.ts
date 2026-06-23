import { supabase } from './supabase'
import { toast } from 'sonner'
import type { LeadStatus } from '@/types/pipeline'

// Marcador usado para identificar interações geradas por automação na timeline.
export const AUTOMATION_MARKER = 'automação Kotz'

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

type NotificationKind = 'info' | 'success' | 'automation' | 'warning'

// Registra uma notificação de auditoria (consumida pelo sino do PipelineHeader).
async function notify(
  tenantId: string,
  title: string,
  message: string,
  type: NotificationKind = 'automation',
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('notifications').insert({
    tenant_id: tenantId,
    user_id: user?.id ?? null,
    title,
    message,
    type,
  })
  if (error) console.error('[automation] notification insert error:', error)
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

      await notify(
        ctx.tenantId,
        'Follow-up agendado',
        `Tarefa de follow-up criada para ${ctx.leadName} (3 dias úteis).`,
      )

      toast.success('Automação ativada', {
        description: 'Criei automaticamente um follow-up para daqui a 3 dias úteis.',
      })
    },
  },
  {
    // Envio de e-mail transacional da proposta via Resend (server-side).
    trigger: (ctx) => ctx.newStatus === 'proposta_enviada' && ctx.oldStatus !== 'proposta_enviada',
    execute: async (ctx) => {
      // 1. Localiza o e-mail do contato vinculado ao lead
      const { data: lead } = await supabase
        .from('leads')
        .select('contact_id')
        .eq('id', ctx.leadId)
        .single()

      if (!lead?.contact_id) return // sem contato → nada a enviar

      const { data: contact } = await supabase
        .from('contacts')
        .select('name, email')
        .eq('id', lead.contact_id)
        .single()

      if (!contact?.email) return // contato sem e-mail → silencioso

      // 2. Token do usuário para autenticar a chamada ao endpoint serverless
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) return

      // 3. Dispara o e-mail via API (falha silenciosa — não bloqueia o lead)
      const res = await fetch('/api/send-proposal-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          to: contact.email,
          contactName: contact.name,
          leadName: ctx.leadName,
        }),
      })

      if (!res.ok) {
        console.error('[automation] envio de e-mail falhou:', res.status)
        return
      }

      // 4. Registra na timeline como interação de e-mail automática
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('lead_interactions').insert({
        lead_id: ctx.leadId,
        tenant_id: ctx.tenantId,
        type: 'email',
        content: `E-mail automático enviado pela ${AUTOMATION_MARKER} para ${contact.email}`,
        created_by: user?.id ?? null,
      })

      await notify(
        ctx.tenantId,
        'E-mail de proposta enviado',
        `Proposta enviada automaticamente para ${contact.email}.`,
        'success',
      )

      toast.success('E-mail enviado', {
        description: `Proposta enviada automaticamente para ${contact.email}.`,
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

      await notify(
        ctx.tenantId,
        'Análise de churn agendada',
        `Lead ${ctx.leadName} foi perdido — tarefa de análise criada (5 dias úteis).`,
        'warning',
      )

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
