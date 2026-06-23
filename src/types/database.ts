export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          plan: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: string
          created_at?: string
        }
        Relationships: []
      }
      tenant_users: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          tenant_id: string
          name: string
          channel: 'instagram' | 'whatsapp' | 'indicacao' | 'outro' | null
          contact: string | null
          service: string | null
          status: 'novo' | 'em_contato' | 'proposta_enviada' | 'fechado' | 'perdido'
          notes: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          channel?: 'instagram' | 'whatsapp' | 'indicacao' | 'outro' | null
          contact?: string | null
          service?: string | null
          status?: 'novo' | 'em_contato' | 'proposta_enviada' | 'fechado' | 'perdido'
          notes?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          channel?: 'instagram' | 'whatsapp' | 'indicacao' | 'outro' | null
          contact?: string | null
          service?: string | null
          status?: 'novo' | 'em_contato' | 'proposta_enviada' | 'fechado' | 'perdido'
          notes?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_interactions: {
        Row: {
          id: string
          lead_id: string
          tenant_id: string
          type: 'note' | 'call' | 'email' | 'meeting'
          content: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          tenant_id: string
          type?: 'note' | 'call' | 'email' | 'meeting'
          content: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          tenant_id?: string
          type?: 'note' | 'call' | 'email' | 'meeting'
          content?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_pipeline_chart_data: {
        Args: { p_tenant_id: string }
        Returns: Array<{
          semana: string
          leads_criados: number
          propostas: number
          fechados: number
        }>
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Shorthand types para uso nos componentes
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInteraction = Database['public']['Tables']['lead_interactions']['Row']
export type InteractionType = LeadInteraction['type']
export type LeadStatus = Lead['status']
export type LeadChannel = Lead['channel']
