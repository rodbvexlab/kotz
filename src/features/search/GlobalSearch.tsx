import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { useGlobalSearch } from './hooks/useGlobalSearch'
import { COLUMNS } from '@/types/pipeline'

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const debouncedTerm = useDebounce(term, 200)
  const { results, isSearching } = useGlobalSearch(debouncedTerm)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTerm('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [debouncedTerm, results.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        navigate(`/pipeline?leadId=${results[selectedIndex].id}`)
        setIsOpen(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex justify-center items-start pt-[15%]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-xl bg-black/60" 
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl bg-[#080c14]/80 border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div className="flex items-center px-4 border-b border-white/10">
          <Search size={20} className="text-[#A1B5CC]" />
          <input
            ref={inputRef}
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar leads, contatos, serviços..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-white placeholder-[#A1B5CC]/50 text-lg"
            autoFocus
          />
          {isSearching ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#1E3E62]/50 border-t-[#FF6500] animate-spin mr-3" />
          ) : (
            <div className="text-[10px] text-[#A1B5CC] font-bold bg-white/10 px-2 py-1 rounded tracking-wider mr-2">
              ESC
            </div>
          )}
        </div>

        {/* Results */}
        {debouncedTerm && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.length > 0 ? (
              <div className="flex flex-col gap-1">
                {results.map((lead, idx) => {
                  const isSelected = idx === selectedIndex
                  const statusMeta = COLUMNS.find(c => c.id === lead.status)
                  
                  return (
                    <div
                      key={lead.id}
                      onClick={() => {
                        navigate(`/pipeline?leadId=${lead.id}`)
                        setIsOpen(false)
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`
                        flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors
                        ${isSelected ? 'bg-white/5 border-l-2 border-l-[#FF6500]' : 'border-l-2 border-l-transparent hover:bg-white/5'}
                      `}
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-[15px]">{lead.name}</span>
                        <span className="text-[#A1B5CC] text-xs mt-1">
                          {(lead as any).company?.name ? `${(lead as any).company.name} • ` : ''}
                          {lead.service || 'Sem serviço definido'}
                        </span>
                      </div>
                      
                      {statusMeta && (
                        <span 
                          className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap"
                          style={{
                            color: statusMeta.accent,
                            backgroundColor: `${statusMeta.accent}15`,
                            border: `1px solid ${statusMeta.accent}30`
                          }}
                        >
                          {statusMeta.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-[#A1B5CC] text-sm">
                  Nenhum lead encontrado para <span className="text-white font-medium">'{debouncedTerm}'</span>.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
