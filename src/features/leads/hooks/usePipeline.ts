import { useReducer, useCallback } from 'react'
import type { Lead, LeadStatus, PipelineState, PipelineAction } from '@/types/pipeline'

// ─── Reducer ────────────────────────────────────────────────────────────────

function buildEmpty(): PipelineState {
  return {
    novo: [],
    em_contato: [],
    proposta_enviada: [],
    fechado: [],
    perdido: [],
  }
}

function pipelineReducer(state: PipelineState, action: PipelineAction): PipelineState {
  switch (action.type) {

    case 'INIT': {
      const next = buildEmpty()
      const seen = new Set<string>()
      for (const lead of action.payload) {
        if (lead && lead.id && !seen.has(lead.id)) {
          seen.add(lead.id)
          if (next[lead.status]) {
            next[lead.status].push(lead)
          }
        }
      }
      return next
    }

    case 'MOVE_CARD': {
      const { leadId, from, to } = action
      if (from === to) return state

      const lead = state[from].find(l => l.id === leadId)
      if (!lead) return state

      return {
        ...state,
        [from]: state[from].filter(l => l.id !== leadId),
        [to]: [{ ...lead, status: to }, ...state[to]],
      }
    }

    case 'ROLLBACK':
      return action.snapshot

    case 'ADD_LEAD': {
      const { lead } = action
      return {
        ...state,
        [lead.status]: [lead, ...state[lead.status]],
      }
    }

    case 'UPDATE_LEAD': {
      const { lead } = action
      const next = { ...state }
      for (const status of Object.keys(next) as LeadStatus[]) {
        next[status] = next[status].map(l => l.id === lead.id ? lead : l)
      }
      return next
    }

    case 'REPLACE_TEMP_LEAD': {
      const { tempId, lead } = action
      const next = { ...state }
      for (const status of Object.keys(next) as LeadStatus[]) {
        next[status] = next[status].map(l => l.id === tempId ? lead : l)
      }
      return next
    }

    default:
      return state
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePipeline() {
  const [state, dispatch] = useReducer(pipelineReducer, buildEmpty())

  const init = useCallback((leads: Lead[]) => {
    dispatch({ type: 'INIT', payload: leads })
  }, [])

  const moveCard = useCallback(
    async (
      leadId: string,
      from: LeadStatus,
      to: LeadStatus,
      persistFn: (id: string, status: LeadStatus) => Promise<{ error: unknown }>
    ) => {
      if (from === to) return

      // Snapshot para rollback
      const snapshot = { ...state }

      // 1. Optimistic update imediato
      dispatch({ type: 'MOVE_CARD', leadId, from, to })

      // 2. Persistência em background
      const { error } = await persistFn(leadId, to)

      if (error) {
        // 3. Rollback se falhar
        dispatch({ type: 'ROLLBACK', snapshot })
      }
    },
    [state]
  )

  const addLead = useCallback((lead: Lead) => {
    dispatch({ type: 'ADD_LEAD', lead })
  }, [])

  const updateLead = useCallback((lead: Lead) => {
    dispatch({ type: 'UPDATE_LEAD', lead })
  }, [])

  const replaceTempLead = useCallback((tempId: string, lead: Lead) => {
    dispatch({ type: 'REPLACE_TEMP_LEAD', tempId, lead })
  }, [])

  return { state, init, moveCard, addLead, updateLead, replaceTempLead }
}
