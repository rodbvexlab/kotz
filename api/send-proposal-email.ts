import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

/**
 * Serverless endpoint — envia o e-mail transacional de proposta via Resend.
 * A RESEND_API_KEY vive APENAS aqui (server-side), nunca no bundle do cliente.
 * Protegido por verificação do JWT do Supabase para impedir abuso (spam).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[resend] RESEND_API_KEY não configurada')
    return res.status(500).json({ error: 'Email service not configured' })
  }

  // ── Auth guard — valida o token do usuário logado ──────────────────────────
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!supabaseUrl || !anonKey || !token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(supabaseUrl, anonKey)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // ── Payload ─────────────────────────────────────────────────────────────────
  const { to, contactName, leadName } = (req.body ?? {}) as {
    to?: string
    contactName?: string
    leadName?: string
  }

  if (!to || typeof to !== 'string') {
    return res.status(400).json({ error: 'Missing recipient' })
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Kotz <onboarding@resend.dev>'
  const resend = new Resend(apiKey)

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Sua proposta da Kotz${leadName ? ` — ${leadName}` : ''}`,
      html: buildTemplate(contactName ?? 'Olá'),
    })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[resend] falha ao enviar:', err)
    return res.status(500).json({ error: 'Send failed' })
  }
}

function buildTemplate(contactName: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#080c14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#080c14;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0d1420;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">Ko<span style="color:#FF6500;">tz</span></span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                ${escapeHtml(contactName)}, sua proposta chegou
              </h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#A1B5CC;">
                Preparamos uma proposta sob medida para você. Em breve nossa equipe
                entrará em contato para alinhar os próximos passos, mas se quiser
                adiantar qualquer dúvida, é só responder a este e-mail.
              </p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#A1B5CC;">
                Estamos animados para trabalhar juntos.
              </p>
              <a href="#" style="display:inline-block;background:#FF6500;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;">
                Ver minha proposta
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;color:rgba(161,181,204,0.5);font-family:'JetBrains Mono',monospace;">
                Enviado automaticamente pela Kotz CRM
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
