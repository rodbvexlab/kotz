-- Sprint 12: Lead Interactions — upgrade schema
-- Non-destructive: renames columns and adds new ones, preserving existing data.

-- Rename note → content
ALTER TABLE public.lead_interactions RENAME COLUMN note TO content;

-- Rename user_id → created_by
ALTER TABLE public.lead_interactions RENAME COLUMN user_id TO created_by;

-- Add type column with default 'note' for existing rows
ALTER TABLE public.lead_interactions
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'note';

-- Add check constraint for valid types
ALTER TABLE public.lead_interactions
  ADD CONSTRAINT lead_interactions_type_check
  CHECK (type IN ('note', 'call', 'email', 'meeting'));

-- Add indexes if missing
CREATE INDEX IF NOT EXISTS idx_interactions_lead   ON public.lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_interactions_tenant ON public.lead_interactions(tenant_id);

-- RLS policies (idempotent — drop if exist first)
DROP POLICY IF EXISTS "Tenant members can view interactions" ON public.lead_interactions;
DROP POLICY IF EXISTS "Tenant members can insert interactions" ON public.lead_interactions;
DROP POLICY IF EXISTS "Tenant members can update their interactions" ON public.lead_interactions;

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
