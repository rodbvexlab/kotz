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
      }
      lead_interactions: {
        Row: {
          id: string
          tenant_id: string
          lead_id: string
          user_id: string | null
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          lead_id: string
          user_id?: string | null
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          lead_id?: string
          user_id?: string | null
          note?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Shorthand types para uso nos componentes
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInteraction = Database['public']['Tables']['lead_interactions']['Row']
export type LeadStatus = Lead['status']
export type LeadChannel = Lead['channel']
