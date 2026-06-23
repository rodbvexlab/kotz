-- Sprint 12: Lead Interactions (history/memory)
-- Drops the old minimal table and recreates with full schema.

DROP TABLE IF EXISTS public.lead_interactions;

CREATE TABLE public.lead_interactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tenant_id  uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type       text NOT NULL DEFAULT 'note' CHECK (type IN ('note', 'call', 'email', 'meeting')),
  content    text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_interactions_lead   ON public.lead_interactions(lead_id);
CREATE INDEX idx_interactions_tenant ON public.lead_interactions(tenant_id);

-- RLS (mirrors leads table policies)
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view interactions"
  ON public.lead_interactions FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant members can insert interactions"
  ON public.lead_interactions FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant members can update their interactions"
  ON public.lead_interactions FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );
